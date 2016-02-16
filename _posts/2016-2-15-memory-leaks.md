---
layout: post
title: 'Preventing memory leaks with unowned, weak and capture lists'
type: post
published: true
status: publish
tags:
- ios
---

In many programming languages, memory management is handled with what's called a garbage collector. But because Apple's libraries are written in Objective-C, apps in Swift must interface with the Objective-C language. As a result, Swift adopts how Objective-C manages memory leaks, which is called reference counting. It's pretty simple; every object has a count of how many references point to it.

When there are no more references,  we can effectively deallocate the object in memory since the program does not need it anymore.

Sounds simple to manage, but here are three instances where circular referencing typically occur, and what Swift language offers to counter memory leaks

<!--more-->
---

**weak**

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

Now looking into the player class, a player should certainly know what team she/he plays for, so Player will have a field Team, that referenced the SportsTeam Class.

In this practical example, you're going to face a circular reference issue because at the current state, both instances will always reference each other, never allowing their reference count to zero out.

By adding weak to Player's Team field, you neglect to increment a reference to Team, at least from this instance, and effectively, you break out of a potential memory leak.

```swift
class Player {
  weak var team: SportsTeam
}
```


However, there are two caveats to using weak in field declarations.

The first is that the objects at matter _have_ to be independent, meaning they can exist without each other. This player and team example fit the bill as Teams can survive without any one player, and a sports player can exist without attributing to any one team.

In code, that means the team field in Player must be *nillable*, or in Swift terms, declared as an optional.

Two things need to work before you can use weak.

Time Independant
- Objects need to have independent lifetimes
- The reference needs to be optional

**unowned**

On the flip side you should use 'unowned' when the two referencing objects do not have independent lifetimes. In other words, the objects need each others, so much that it would make sense for one to exist without the other. Nil is not a reasonable value for the reference

** WEAK SELF **

There's one last scenario to keep a eye out for regarding  memory leaks, and that's in closures.

When you reference an instance variable or call a method in swift, you're implicitly calling self. In a closure however, Swift requires that you explicitly declare self so you are aware self is getting "captured" within the closure block.


-
Closures are very tricky because they are *reference* types.
That means when you set a variable.


There are capture semantics of closures.

All weak instances must be optional

Swift does not allow you to access an instance's reference count, because there may be things under the hood of the compiler that make additional calls to retain or release. Though based on what I know, it's simply more important to recognize where strong reference cycles can exist and what we can do to avoid them.
