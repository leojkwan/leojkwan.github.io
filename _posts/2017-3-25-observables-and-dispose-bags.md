---
layout: post
title: 'Living reactively in Swift, before RxSwift. And truly understanding "DisposeBags"'
type: post
status: published
comments: true
categories:
tags:
- ios
- swift 3
- RxSwift
- Observables
---

When I first learned to program about 2 years ago, one term that spooked me real good was this thing called Reactive Cocoa. It's not a friendly sight of code when you see it for the first time. I remember thinking, 'What the heck is RAC? - I've never learned in class at Flatiron School. Ehrm, Run.'

More recently, I decided to dig deeper into reactive programming, looking into more resources/blogs about RxSwift. You also know RxSwift has hit the mainstream of iOS swift programming recently after a dedicated book about RxSwift gets published on <a href="https://store.raywenderlich.com/products/rxswift?_ga=2.96130460.1493240101.1493879651-1050811074.1485642105">Ray Wenderlich</a> … and I bought it ;). 

But before trying to understand a full-fledged framework like RxSwift, I tried becoming more reactive with my code without a framework, and I enjoyed it. Let me explain.

<!--more-->

What I did initially was leverage a native, and very simple, Swift Observable pattern I picked up from a popular Swift example project, <a href="https://github.com/JakeLin/SwiftWeather/blob/fbd206fd7cf22badb9c758fe1e88d684d65cfc6f/SwiftWeather/Observable.swift">SwiftWeather</a>.

Since then, I’ve come to better appreciate a ‘reactive’ style of programming, especially when you add some MVVM flavor into the mix. The results were immediate to me, and I found that I wrote less boilerplate delegate/protocol code. I also don’t need to ever consider NotificationCenter(not that I used it much in the first place.) And most importantly, I reduced a ton of cognitive load when mentally trying to remember the multiple states my objects are in at any given point, specifically in view controllers.


```swift
class Observable1<T> {
  
  typealias Observer = (T) -> Void
  private(set) var observer: Observer?
  
  func observe(_ observer: Observer?) {
	self.observer = observer
  }
  
  var value: T {
	didSet {
	  observer?(value)
	}
  }
  
  init(_ v: T) {
	value = v
  }
}
```


I’d simply enclose a value in this class named ‘Observable’, and this object would take in one observer that subscribed to the wrapped value’s changes. 

The core line lies in the ‘value’ didSet method. Every time a value is set, the observer, which is a function that accepts the wrapped value’s type, gets called with the updated value.

```swift
var value: T {
	didSet {
	  observer?(value)
	}
}
```

There's really no magic to it; as another developer who realized this Observable/KVO pattern pointed out, <a href="http://blog.jaredsinclair.com/post/136419814560/imagining-a-first-party-swift-kvo-replacement">*It would follow all the existing rules of memory management and variable scope as any other closure*</a>

```swift
class ViewController: UIViewController {
  
  var currentWeather: Observable<Double> = Observable(50)
  
  override func viewDidLoad() {
    super.viewDidLoad()
   
    currentWeather.observe { (newPrice) in
      print("1. Updated Temperature: \(newPrice)")
    }
    
    currentWeather.value = 50 // 1. Updated Temperature: 50
    currentWeather.value = 51 // 1. Updated Temperature: 51
    currentWeather.value = 52 // 1. Updated Temperature: 52    
  }
}
```


---

Simple example, not **realistic**. In reality, I probably want multiple things subscribing to currentWeather's changes.

```swift
class ViewController: UIViewController {
  
  var currentWeather: Observable1<Int> = Observable1(50)
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    currentWeather.observe { (newPrice) in
      print("1. Updated Temperature: \(newPrice)")
    }
    
    // Added a second observer
    currentWeather.observe { (newPrice) in
      print("2. Updated Temperature: \(newPrice)")
    }
    
    // Added a third observer
    currentWeather.observe { (newPrice) in
      print("3. Updated Temperature: \(newPrice)")
    }
    
    currentWeather.value = 50 // 3. Updated Temperature: 50
    currentWeather.value = 51 // 3. Updated Temperature: 51
    currentWeather.value = 52 // 3. Updated Temperature: 52    
    
  }
}
```

Looks go-- ***Wait***. That's not right. I get print statements from only the third observer — what about the 1st and 2nd ones? 

Looking back at Observable, I see that observer is a single property; so every time `subscribe` get called on currentWeather, the last observer gets **written over** by the newly passed in one. 


### This is when things got difficult.


At first thought, the most practical thing to do in order for Observable to push changes to multiple observers is to change `observer: Observer<T>` to an `observers: [Observer<T>]`. Sounds like a quick and easy fix!

```swift
class Observable<T> {
  
  typealias Observer = (T) -> Void
  private(set) var observers: [Observer] = [] // change to an array

  func observe(_ observer: @escaping Observer) {
    // append observer to array
    observers.append(observer)
  }
  
  var value: T {
    didSet {
      // iterate over observers and call each closure newly set value
      observers.forEach({$0(value)})
    }
  }
  
  init(_ v: T) {
    value = v
  }
}
```

<br>
**There**.
Now we should be able to notify every function/observer in our `observers` array.

```swift
currentWeather.observe { (newPrice) in
      print("1. Updated Temperature: \(newPrice)")
}
    
currentWeather.observe { (newPrice) in
      print("2. Updated Temperature: \(newPrice)")
}
    
currentWeather.observe { (newPrice) in
      print("3. Updated Temperature: \(newPrice)")
}
    
currentWeather.value = 51
currentWeather.value = 52
currentWeather.value = 53
// 1. Updated Temperature: 51
// 2. Updated Temperature: 51
// 3. Updated Temperature: 51
// 1. Updated Temperature: 52
// 2. Updated Temperature: 52
// 3. Updated Temperature: 52
// 1. Updated Temperature: 53
// 2. Updated Temperature: 53
// 3. Updated Temperature: 53

```
<br>
### Sweeeet.
![](https://media.giphy.com/media/l0HlCUPEhddvUuGsw/giphy.gif)
{: class="responsive-image" style="margin:0 auto;width:50%;" }

This is very similar to what RxSwift does with `subscribe(...)` and `Variable`. Here's an example of what an observable array of strings would look like.

```swift
import RxSwift

class ViewController: UIViewController {
  
  let disposeBag = DisposeBag()
  let names = Variable(["Leo"])

  override func viewDidLoad() {
	super.viewDidLoad()
	
	names.asObservable().subscribe { (updatedArray) in
	  print(updatedArray.element ?? "no element")
	}
	.addDisposableTo(disposeBag)
	
	names.value.append("John")
        // ["Leo"]
        // ["Leo", "John"]
  }
}
```


Now there’s one *clear* difference between my example and RxSwift's example of an Observable. That's the ‘DisposeBag’.

---

## Enter DisposeBag rabbit hole.
<br>

It was only after using my own Swift Observable implementation where I realized I was missing something critically important. 

The observers are never deallocated. If you are observing the weather in a detail view controller and pop back to the root view, the detail view controller should be deallocated, along with anything owned by that view controller.

<img src="https://s3-us-west-2.amazonaws.com/leojkwan/videos/rxSwift-memory-leak.gif" style="display:inline;margin:0 auto;width:100%;">


The problem with our Observable implementation is that after adding an observer to our Observable, **we don't know how** to remove it when the observer's associated object is deinitialized. We need a mechanism for the observable, like `currentWeather` above, to differentiate its active observers from observers that are no longer referenced anywhere.

<a href="http://blog.jaredsinclair.com/post/136419814560/imagining-a-first-party-swift-kvo-replacement">Jared Sinclair</a> brought up a great point about marking each observable with a token/unique key. Instead of just an observables array, we'll use a dictionary that gives each observer a unique key; when a new observer is inserted, we return it's key.

This is when the concept of a *dispose bag* is needed. A bag is simply a collection of things that are not ordered, and can have repeated things in it, unlike a set. Similar to RxSwift, we'll use a 'DisposeBag' that stores all of our observer's unique keys. In addition, this bag needs to trigger the removal of every observer that is referenced in our bag from our Observable when it's owner deallocates(a view controller in our example.) 

That was a difficult sentence to understand, so I'll break it down using our weather temperature above. When we start the application, our root view controller, VC1, subscribes one observer. When we push into the detail view controller, VC2, we subscribe another observer. 

On subscribe, we return a Disposable, which is just an object that represents the key associated with that observer. We need to take that Disposable and place it a DisposeBag within VC2. It must be in the local scope of VC2 because when we pop the view controller and deinitialize VC2 and any references VC2 owns, our dispose bag needs to be on of them.

```swift
class MyDisposeBag {
  
  var disposables: [Disposable] = []
  
  func add(_ disposable: Disposable) {
    disposables.append(disposable)
    print("new dispose bag count: \(disposables.count)")
  }
  
  func dispose() {
    disposables.forEach({$0.dispose()})
  }
  
  // When our view controller deinits, our dispose bag will deinit as well
  // and trigger the disposal of all corresponding observers living in the
  // Observable, which Disposable has a weak reference to: 'owner'.
  deinit {
    dispose()
  }
}
```

And it works! We have a crude, but working Observable implementation written in Swift. It doesn't leak memory and properly disposes of dereferenced closures. It allows multiple observers to subscribe to an Observable and enforces compile-time type safety by using generic properties and classes. Lastly, it doesn't require pulling in a full-fledged reactive framework like RxSwift.

<a href="https://github.com/leojkwan/Native-Observable-Pattern">Check out the final example here</a>
<a href="https://gist.github.com/leojkwan/aa7d11a394db1c176b136d59bc680230">Gist</a>

In a future post, I'll dive into some of the bells and whistles that come with using RxSwift! There's a lot!