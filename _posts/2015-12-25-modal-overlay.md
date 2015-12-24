---
layout: post
title: 'Presenting a simple walkthrough screen in your iPhone app.'
date: 2015-12-24 16:01:41.000000000 -04:00
type: post
published: true
status: publish
categories:
- Code
tags:
- code
- example
---


After I pushed the my first app Muse into the app store. I realized I left many users in some confusion with my app's main feature: tagging currently playing songs into your journal entry.

As a developer, I've been staring at my code and storyboard for so much, I forgot how that novel feeling I once I had first started my project.

<!--more-->
---

## The problem:
When people begin writing an entry, they're welcomed with 3 icons in my toolbar.
To me, the icons seemed very obvious; after all, I was the one who hooked up all the logic and user interface for the buttons. What don't you understand!?

But with some constructive feedback from several friends and test users, I learned that a quick walkthrough or message was desperately needed in order for users to understand the functionality Muse uniquely offers.

### I needed a quick fix.

I could have gone back to the drawing board to remap how I'd present the app more reasonably to make my apps purpose clearer, or I could just toss on a overlay message where needed. Since I needed a quick and easy way to inject a walkthrough note so, I went with the latter.

This modal would present itself when a user first creates an entry in my app.

![](https://s3-us-west-2.amazonaws.com/leojkwan/images/entry-walkthrough-modal.png)
{: class="responsive-image" style="margin:0 auto;width:50%;" }


I figured this may not be the last time I would need a blur modal, so I created a class called MUSBlurOverlayViewController.h.

I also created the UI walkthrough view

{% highlight objc %}

//EntryWalkthroughView.m

// Quick entry walkthrough for users
// writing an entry for the first time.

#import <UIKit/UIKit.h>

@protocol WalkthroughDelegate <NSObject>
-(void)dismissView;
@end

@interface EntryWalkthroughView : UIView
@property (nonatomic, assign) id <WalkthroughDelegate> delegate;

@end
{% endhighlight %}
---

### The most important point here is the [delegate]({% post_url 2015-09-08-design-patterns-delegation-in-swift %}) declared in the header.
{: style="text-align:center;"}
<br>

There needs to be some way for this custom view to communicate with my blur view controller, and the delegate design pattern will do just that. A delegate is something that acts on behalf of some other class; in this case, I want my view controller to do something, specifically dismissing a view, when my walkthrough view’s **“okay"** button is selected.

In order for my view to be considered a delegate, I also declared a protocol, which is a set of tasks the delegate (my blur view controller) must perform to be considered the delegate. You’ll notice that my delegate type is of ‘WalkthroughDelegate’.

{% highlight objc %}

@property (nonatomic, assign) id <WalkthroughDelegate> delegate;
{% endhighlight %}

The protocol in this example only requires one job to be fulfilled, and that’s ’(void)dismissView;’. You might be wondering, what does this function do? Well, that’s for the delegate to decide, aka my view controller. The protocol only says what jobs you need to do, not how you should do them. Awesome.

So when the button is pressed, we want to trigger the delegate’s method didSelectButton, which is equivalent to a boss saying , ‘hey! do this task that you signed up for, 'dismissView'.

Here’s how I implemented that function in my custom walkthrough view

{% highlight objc %}
// Done Button
UIButton *doneButton = [[UIButton alloc] init];

[doneButton addTarget:self action:@selector(doneButtonTapped:)
forControlEvents:UIControlEventTouchUpInside];

...

-(void)doneButtonTapped:(id)sender {
  [self.delegate dismissView];
}
{% endhighlight %}


Once the button is tapped it will call any object conforming to the WalkthroughDelegate to perform the method dismissView.
Of course, the blur view controller has that all covered.

{% highlight objc %}
-(void)dismissView {
     [self dismissViewControllerAnimated:YES completion:nil];
}
{% endhighlight %}

The last thing that most people forget to do when dishing out delegates is actually declaring who the delegate it. In my view controller that will present the blur view controller with custom view. I must state who will be acting on behalf of the blur view.

{% highlight objc %}
walkthroughView.delegate = modalBlurVC;
{% endhighlight %}

<br>

Here’s the code block for more context:

{% highlight objc %}
-(void)presentEntryWalkthrough {
EntryWalkthroughView *walkthroughView = [[EntryWalkthroughView alloc] init];

MUSBlurOverlayViewController *modalBlurVC= [[MUSBlurOverlayViewController alloc]
initWithView:walkthroughView
blurEffect:[UIBlurEffect effectWithStyle:UIBlurEffectStyleDark]];

modalBlurVC.modalTransitionStyle = UIModalTransitionStyleCoverVertical;
modalBlurVC.modalPresentationStyle = UIModalPresentationOverFullScreen;

// Set the delegate for my custom entry walkthrough view.
walkthroughView.delegate = modalBlurVC;

[self presentViewController:modalBlurVC animated:YES completion:nil];
}

{% endhighlight %}

### Creating a quick and easy walkthrough modal screen helped me fix a clear user experience fault in my app. If you're interested, check out the real app— [Muse, in the app store](http://www.musetheapp.com)!
{: style="text-align:center;" }

<br>

![](https://s3-us-west-2.amazonaws.com/leojkwan/images/walkthrough-modal.gif)
{: class="responsive-image" style="margin:0 auto;width:50%;" }
