---
layout: post
title: 'iOS Design Patterns: Delegation'
date: 2015-09-08 16:01:41.000000000 -04:00
type: post
tags:
- ios
---

Knowing what design pattern to implement in your code is one of the most important skills to have as a competent iOS developer.
<!--more-->

<p> No, design patterns have nothing to do with user interface or visual design-who would ever think that? -scratch head- Rather, they are reusable solutions that solve common problems, particularly with communication between objects in code. </p>
<p> There are many powerful design patterns found in iOS development. For this blog post, I wanted to expand on the <strong>delegate pattern</strong> in iOS.<!--more--></p>
<hr />

## What it delegation?

Delegation is a variation of a common design pattern in object oriented programming known a <em>decorator</em> pattern, in which a user can 'wrap' additional functionality to an object without interfering its class structure.

Pertaining to iOS, delegation is a mechanism in which one object acts on behalf of another object. It allows objects to avoid subclassing from a ‘parent’ class just to inherit it’s parent’s capabilities. Inheritance patterns make a child object highly dependent of its parent, which is considered ‘tight coupling’. As a result, the single responsibility principle and separation of concerns between these classes begin to blur, and that’s bad.

### How delegation fixes that.

Delegation remedies tight coupling because the only thing binding two objects together then is simply an agreement that the delegate object will implement certain methods that fulfill a particular responsibility. A perfect example of delegation found in iOS programming is the relationship between UITableView and UIViewController.

A UITableView is not aware of how many rows and sections it should present; it just knows that it has to present some visual representation of a table view, which is really just an ordered set of data. The task of providing table view values such as number of rows, sections, and cell height is designed for the UITableView delegate, which is usually a UIViewController that says, “I will be in charge of displaying specific data to your table view.” We achieve that by setting the view controller as the table view delegate like this.

{% highlight objc %}
self.tableview.delegate = self;
{% endhighlight %}

<p>This powerful relationship between UITableView and UIViewController is considered very loose- and within computer programming, that’s a wonderful thing because it allows our view controller to be more versatile in the future. After all, it can be the delegate not just for tableviews, but scrollviews, search bars, keyboards, etc.</p>
<hr />
<h2><strong>Implementation.</strong></h2>
<p>We covered how powerful delegating tasks can be without directly inheriting from a parent class just for its desired functions. Let’s consider how we’re going to get on object like UIViewController to implement methods and functionality from an otherwise incompatible object like UITableView. This is where Protocols come in.</p>
<h3><strong>Protocols.</strong></h3>
<p>A protocol is exactly what it means in the real world: a set of procedures, a system of rules, some official agreement between parties. When you define a protocol with functions, any object that ‘conforms’ to that protocol <em>must</em> implement its functions.</p>
<p>Well, that’s not entirely true.</p>
<p>In Objective-C, you had the option of declaring which protocol function implementations were required and optional. With Swift, there is currently no official way to do that. You can write an Objective-C or Swift protocol depending on what suits you.</p>
<p>In Swift, this is how a protocol is defined:</p>
{% highlight swift %}
protocol LeoProtocol {
  func coolFunction()
}
{% endhighlight %}


<p>Here is an implementation of a class conforming to the LeoProtocol:</p>

{% highlight objc %}
class someClass: LeoProtocol {
  func coolFunction() {
  // implementation of this protocol function
  }
}
{% endhighlight %}

<p>However, if you want to define a protocol with optional methods in Swift, you will need to declare an <strong>Objective-C</strong> protocol; the directive looks like this:</p>

{% highlight swift %}
@objc protocol LeoProtocol {
  func coolFunction()
  optional func coolOptionalFunction()
{% endhighlight %}

<hr/>
<h2><b>Summary</b></h2>
<p>In short, the general steps to defining a protocol in Swift are:</p>
<ol>
<li>Write out your a protocol functions</li>
<li>Add a delegate property specifying the type as the protocol</li>
<li>Assign any object that conforms to the protocol to that delegate property</li>
</ol>
<p>Feel free to comment below if you think there's anything I missed or should clarify.</p>
<p>The next design pattern post will be about the <strong>Observer</strong>.</p>
<p style="text-align:justify;">
