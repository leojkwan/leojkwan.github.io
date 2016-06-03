---
layout: post
title: 'Learning in playgrounds with generics and hashable Part 2'
type: post
status: draft
categories:
tags:
- ios
---

# Hashable

I mentioned the protocol Hashable in the last post. Not all things can serve as a key in a dictionary. But we don't settle with just strings and numbers. We want to compare classes and structs as well. The challenge is that structs and classes do not conform to Hashable by default, so unlike the strings and integers used in earlier examples, we'll need to implement Hashable protocol. It's like joining a fraternity or sorority —  you need to fulfill your duties before you're a ... Kappa, Sigma, or ... 'Hashable'!

<!--more-->


Hashing can be pretty <a href="https://github.com/raywenderlich/swift-algorithm-club/tree/master/Hash%20Table">complicated</a> topic but it's basically the ability to identify an object in integer form. The complicated part comes in the various ways one can create these integers to optimize the retrieval time of them. But if you just think about a real dictionary, the process boils down to indexing anything into searchable terms, in this case- words. The goal is to do the same with our objects in code. Game changer.

```swift
public struct Dictionary<Key : Hashable, Value> : CollectionType, DictionaryLiteralConvertible {

  // Standard functions and fields
  // for your plain old Dictionary in here

}
```
This is the standard dictionary in Swift. Notice the key conforms to the hashable protocol.
{: class="image-caption"}

<br>

Like the function in the <a href="/2016/generics-hashable-1/">last post</a>, Apple's implementation of a dictionary takes advantage of generics and you guessed it— the key must conform to the hashable protocol.

But not only must keys be hashable, they must be **'equatable'** too. Hashable directly conforms to the Equatable protocol, resulting in another requirement our object key must fulfill to serve as Hashable.
Being Equatable is for good reason; not only should our hashed objects be indexed in a dictionary, they should be able to distinguish themselves from their fellow hashed objects! In other words, they should be 'are you me or are you not me!?' Now since we're implementing the protocols ourselves, we set the rules. We can formulate what measurements qualify one object equal another. More on that later.

<br>




---

##### This is the standard Hashable protocol in Swift.

```swift
public protocol Hashable : Equatable {
  public var hashValue: Int { get }
}
```

##### This is the standard Hashable protocol in Swift.

```swift
public protocol Equatable {
    public func ==(lhs: Self, rhs: Self) -> Bool
}
```
<br>

---


### Creating our object key.
{: class="title-text"}


#### Let's start by making the most simple struct hashable.

```swift
struct Person {
  var name: String
}
```
<br>

##### From the requirements above, we simply need to do **2 things** for our object.
1.  Define a custom *Hashable protocol*
2.  Define a custom *Equatable protocol*

---

## 1
{: class="subtitle-text"}

```swift
extension Person: Hashable {
  var hashValue: Int {
    return name.hashValue
  }
}
```

We set the hashvalue of the object's name string as the object's hash value.

---

# 2
{: class="subtitle-text"}

```swift
extension Person: Equatable {
}

func == (lhs:Person, rhs: Person)-> Bool {
  return lhs.name == rhs.name
}
```

**lhs** and **rhs** stand for left hand side and right hand side, respectively. The sides are in reference to their position from the equal operator ==.

<br>

##### _The only weird looking thing about step 2 is the empty extension for Equatable._
Notice the standard implementation for Equatable requires the operator overload function, == to be public. Public. That means when we define ==, it needs to be in the _**global**_ scope. You <span style="text-decoration:underline;font-weight:bold;">cannot</span> implement them in the class definition! We need this as a global function.

---

<br>

### Finishing up
{: class="title-text"}


Alright, we've now extended our Person struct to conform to both the Equatable and Hashable protocol. Let's use the function I created in the last post to find the item count for some 'Person' objects we declared earlier.
<br>

``` swift
let leo = Person(name: "Leo")
let nicole = Person(name: "Nicole")
let leonardoButCalledLeo = Person(name: "Leo")
let ashton = Person(name: "Ashton")

let arrayOfPeople = findItemCountForArray([leo,leonardoButCalledLeo,ashton,nicole])

// Result: [{name "Leo"}: 2, {name "Ashton"}: 1, {name "Nicole"}: 1]
```
You'll notice that our structs are serving as the keys to our objects! Very cool. Notice that objects 'leo' and 'leonardoButCalledLeo' evaluate as the same object, incrementing items indexed by "Leo" to 2. Again, that's only possible after defining Person equality by "name" in our Equatable protocol.

<br>

##### And that's really it.
{: class="subtitle-text"}

Going forward, a more practical use case for object keys would be when your code needs to associate an object with a value, but the particular value doesn't *have* to live in the object class. Suppose instead of Person, we had something more specific, say 'BasketballPlayer'. If we wanted to represent every player's played games, instead of storing an array of games within the 'BasketballPlayer' class, we're better off creating a dictionary of basketball games indexed by participating players. By extending Hashable and Equatable, you can do just that!

---

<br>

Source Code for this post.
{% gist leojkwan/00b1f8482274c71a861e9ff4370a4336 %}
