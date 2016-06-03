---
layout: post
title: 'Learning in playgrounds with generics and hashable Part 2'
type: post
permalink: /:categories/:year/learning-in-playgrounds-2
published: false
status: draft
tags:
- ios
---

# Hashable

I mentioned the protocol Hashable in the last post. Not all things can serve as a key in a dictionary. But we don't settle with just strings and numbers. We want to compare classes and structs as well. The challenge is that structs and classes do not conform to Hashable by default, so unlike the strings and integers used in earlier examples, we'll need to implement Hashable protocol. It's like joining a fraternity/sorority. You need to fulfill some duties before you're a ... Kappa, Sigma, or ... 'Hashable'!

<!--more-->


Hashing can be pretty complicated topic but it's basically the ability to identify an object in integer form. The complicated part comes in the various ways one can create these integers to optimize the retrieval time of them. But if you just think about a real dictionary, the process boils down to indexing anything into searchable terms, in this case- words. The goal is to do the same with our objects in code. Game changer.

Like the function in the last post, Apple's implementation of a dictionary takes advantage of generics and you guessed it— the key must conform to the hashable protocol. But not only must keys be hashable, they must be 'equatable' too. Hashable directly conforms to the Equatable protocol, resulting in another requirement our object key must fulfill to serve as Hashable. Being Equatable is for good reason; not only should our hashed objects be indexed in a dictionary, they should be able to distinguish themselves from their fellow hashed objects! In other words, they should be 'are you me or are you not me!?' Now since we're implementing the protocols ourselves, we set the rules. We can formulate what measurements qualify one object to equate to another. More on that later.

```swift
public struct Dictionary<Key : Hashable, Value> : CollectionType, DictionaryLiteralConvertible {
  // Standard functions and fields
  // for your plain old Dictionary in here
  // Cmd Click 'Dictionary' in
  // XCode to see everything in detail.
  ...
}
```

This is the standard dictionary in Swift. Notice the key conforms to the hasable protocol.
--------------

This is the standard Hashable protocol in Swift.

public protocol Hashable : Equatable {
  public var hashValue: Int { get }
}

This is the standard Equatable protocol in Swift.

public protocol Equatable {
    public func ==(lhs: Self, rhs: Self) -> Bool
}

Creating our object key.

Let's start by making the most simple struct hashable.

struct Person {
  var name: String
}

From the requirements above, we simply need to do 2 things.
1. Define a custom Hashable protocol for our object.
2. Define a custom Equatable protocol for our object.


# Step 1

extension Person: Hashable {
  var hashValue: Int {
    return name.hashValue
  }
}

We set the hashvalue of the object's name string as the object's hash value.


# Step 2
extension Person: Equatable {
}

func == (lhs:Person, rhs: Person)-> Bool {
  return lhs.name == rhs.name
}


lhs and rhs stand for left hand side and right hand side, respectively. The sides are in reference to their position from the equal operator ==.
---
The only weird looking thing about step 2 is the empty extension for Equatable. Notice the standard implementation for Equatable requires the operator overload function, == to be public. Public. That means when we define ==, it needs to be in the global scope. You cannot implement them in the class definition! We need this as a global function.
