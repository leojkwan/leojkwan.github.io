---
layout: post
title: 'Preventing memory leaks with unowned, weak and capture lists'
type: post
published: true
status: publish
tags:
- ios
---

In many programming languages, memory management is handled with what's called a garbage collector. With iOS, the rules are a bit different. Apple implements a slightly different method for managing memory in its native app ecosystem called reference counting. Even Swift manages its memory with reference counting since Apple's libraries are written in Objective-C, forcing Swift to interface with the Objective-C language.
<!--more-->

The idea is pretty simple; every object in memory within your application has a count of how many references point to it. When there are no more references, you can effectively deallocate the object in memory since the program does not need it anymore. Sounds simple to manage, but here are three instances where circular referencing typically occur, and what Swift language offers to counter memory leaks

<br>

## 1. <u>Weak references</u>
Say you have an a class named SportsTeam. In this team class, you have an array of type Player.

```swift
class SportsTeam {
  var players: [Player]?
}
```

```swift
class Player {
  var team: SportsTeam
}
```

Now looking into the player class, a player should certainly know what team she/he plays for, so Player will have a field 'Team', which references the SportsTeam Class.

In this practical example, you're going to face a circular reference issue because at the current state, both instances will always reference each other, never allowing their reference count to zero out.

By adding weak to Player's Team field, you neglect to increment a reference to Team, at least from this instance, and effectively, you break out of a potential memory leak.

```swift
class Player {
  weak var team: SportsTeam?
}

class Team {
  var players: [Player] = []

  func addPlayer(newPlayer:Player) {
    players.append(newPlayer)
  }
}
```

However, there are two caveats to using weak in field declarations.

The first is that the referencing objects _have_ to be independent, meaning they can exist **without each other**. This relationship between a player and team object is an ideal use case for 'weak' because any instance of team can survive without players(empty array), and any player can exist without attributing to a team. That means the team field in Player **must be nillable**, or in Swift terms, declared as an optional.

In summary, use a weak reference when your object has as independent lifetime and when it's reference is declared as an optional.

#### What happens when the lifetime of one object is dependent on its reference?
{: style="text-align:center;" }

<br>

## 2. <u>Using unowned references</u>
On the flip side you should use 'unowned' when the two referencing objects <b>do not</b> have independent lifetimes. Basically, that mean the objects <b>need</b> each other— so much that it wouldn't make sense for one to exist without the other.

```
class Team {
  unowned var createdBy:Player
  init(createdBy: Player) {
    self.createdBy = placedBy
  }

  class Player {
    var Teams: [Team] = []
  }
}
```
In this example, when Player is destroyed, the reference count in Team will be decremented, and the unowned reference to Player in Team will be ignored by the system.

Nil is not a reasonable value for Team's unowned 'placedBy' reference because it had to be created from somebody! When the lifetime of one object depends on the lifetime of another, use unowned to handle potential circular references.  


<br>

## 3. <u>[unowned self] in closures<u>

#### Background to closures in Swift
There's one last scenario to keep a eye out for regarding  memory leaks, and that's in closures. Closures are very tricky because they have 'capture semantics'. By default, they have a strong reference to any variable it uses within its scope. When you reference an instance variable or call a method in swift, you're implicitly calling self. In a closure however, Swift requires that you explicitly declare self so you are aware self is getting "captured" within the closure block.

```
Call to method 'netWorthDidChange' in closure requires explicit
'self.' to make capture semantics explicit
```
{: class="code-block"}

You'll get a compiler error like this within a closure if you ever reference an outer scope variable without explicitly declaring 'self'. The language wants you understand the possibility of a strong reference cycle in this scenario. Then, how do we solve this strong reference to variables within a closure? The solution is in the power of **capture lists**.

```
class Player {
  let firstName: String
  let lastName: String
  init(_ firstName:String, lastName:String) {
    self.firstName = firstName
    self.lastName = lastName
  }

  lazy var greeting:()-> String = { [unowned self] in
  return "Hi, my name is \(self.firstName) \(self.lastName)."
  }
}
let leo = Player("Leo", lastName:"Kwan")
print(leo.greeting())
```

Take a look at the strange looking array bracket in the 'greeting' closure field— [unowned self].

Because closures are objects, we would normally run into another circular reference issue because 'Player' references the 'greeting' closure while the closure references **self**. Like I mentioned earlier in the unowned section above, we need to make sure that a referenced object's lifetime (in this case— a closure's) is the same as that of Player? **We need unowned self again!**
<br>

### This time, however,
it will appear in the form of what's called a capture list. I don't fully understand capture lists to expound on them further, but basically, it's a bracket syntax you add before any parameter clauses in a closure to circumvent circular reference problems. For this example, capture lists allows us weakly reference self, the closure's creating object, which in turn makes the lifetime of both objects equivalent since the compiler will ignore the closure's unowned reference count.
<br>

### Conclusion
So these are three common scenarios to keep in mind while avoiding memory leaks in Swift. I don't think Apple's compiler will allow you to access an instance's reference count. Even if you can, there's probably many things happening under the hood making additional calls to retain or release. But I suppose it's more important to recognize where strong reference cycles can exist and what we can do to avoid them!
