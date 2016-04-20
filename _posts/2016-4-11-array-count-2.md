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

I mentioned the protocol Hashable earlier. Not all things can serve as a key in a dictionary. It's like joining a fraternity/sorority. You need to fulfill some duties before you're a ... Kappa, or a Sigma, or a ... 'Hashable'!
<!--more-->

The concept of hashing is pretty complicated, but it's basically the ability to identify an object in integer form. If there was a way to 'hash' the cookie jar next to my laptop, I could give you the long integers, or hash value, and you would know those numbers reference my cookie jar. You can see why keys in a dictionary need to be hashable!

Like our function, Apple's implementation of a dictionary also takes advantage of generics, and you guessed it— the key conforms to the hashable protocol!

```swift
public struct Dictionary<Key : Hashable, Value> : CollectionType, DictionaryLiteralConvertible {...}
```

Why is this so important? We already solved the problem and can figure out Taylor Swift's most used words in Black Space, what's the deal?

The deal is that we don't settle. We want to compare classes and structs as well. The challenge is that structs and classes do not conform to Hashable by default, so unlike the strings and integers we used in the earlier examples, we'll need to implement Hashable protocol.

Good news. It's not that hard.
