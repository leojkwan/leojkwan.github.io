---
layout: post
title: 'How to utilize Nibs/ Xibs for reusable views in Objective-C'
date: 2015-08-07 14:21:09.000000000 -04:00
type: post
status: publish
categories:
- Code
tags: []
---

For my group's final project here at The Flatiron School, we're making an app that connects travelers with locals who offer personalized, authentic tours of their city. Our app serves as a marketplace for users to present and book tours.
<!--more-->

<br>

We created a low fidelity wireframe sketch of our app and delegated its separate workflows amongst the four of us. Since I'm covering the user profile aspect of our app, I often need to reuse views like profile image, or a user info snippet. Because of that, I've been implementing nibs quite extensively throughout our app's overall design flow.

![](https://s3-us-west-2.amazonaws.com/leojkwan/images/xib-screenshot.png)
{: class="responsive-image" style="margin:0 auto;width:75%;" }


At the Flatiron School, we started the program with storyboards. It was my bread and butter, and I didn't want to leave it, solely because I had no idea how else I'd something in my view controller. It's rare to see iOS tutorials these days that do not go straight to storyboard, rather than working programmatically or with nibs. And why would they? The Storyboard GUI is convenient to use and becoming more powerful each and every Xcode update.
But the storyboard can get cramped and trying to figure out how all your layout constraints are properly set can become a nightmare real quick.

---

### The Power of Nibs
<p>That's where nibs come in. You separate a single view into it's own class and nib file (basically a storyboard) and work from there.</p>
<p>The caveat of displaying nibs on a view controller is that it doesn't solve the constraints that would lay in storyboard. Getting your nibs to display exactly the way you layered it from your nib view file can be just as difficult without additional help.</p>
---

## The Power of Masonry
<br>
NSLayout Constraints- no thanks. VFL, maybe. Masonry, absolutely.
Masonry makes setting constraints a whole lot easier. You can find the CocoaPod <a href="https://github.com/SnapKit/Masonry">here</a>. Nibs and Masonry work like a charm together. Better yet, masonry works well with just about any view that needs a constraint, nib on no nib.
The example I will show is a generic profile view controller I made by programmatically stacking nibs together through masonry.

### Step 1. Get your xib to show on your controller.
Before you try and connect your data models to your nib file, just try and get the xib to properly appear in your desired view. The last thing you want to do is try and solve a poorly set nib view and incorrect data passing simultaneously. At that point, it becomes unclear what the real problem is.</p>

### Step 2. Create a xib file and its corresponding view files.

You need three files. A xib, and a UIView subclass .h and .m.
<br/>
Make sure they are all the same name. Well it doesn't really matter but you'll see later how keeping a unified name for all three files lead to reusable code snippets. And it looks cleaner. Just do it.

<br>

![](https://s3-us-west-2.amazonaws.com/leojkwan/images/xib-screenshot2.png)
{: class="responsive-image" style="margin:0 auto;width:75%;" }

![](https://s3-us-west-2.amazonaws.com/leojkwan/images/xib-screenshot3.png)
{: class="responsive-image" style="margin:0 auto;width:75%;" }

![](https://s3-us-west-2.amazonaws.com/leojkwan/images/xib-screenshot4.png)
{: class="responsive-image" style="margin:0 auto;width:75%;" }

<br>

###In your nib file...

1. Drag a UIView onto storyboard
2. Set the File Owner to the UIView subclass you just created, ideally with the same name as your nib
3. Set 3 methods into your view.


{% highlight objc %}
-(id)initWithCoder:(NSCoder *)aDecoder {
  self = [super initWithCoder:aDecoder];
  if(self) {
    [self commonInit];
  }
  return self;
}

-(instancetype)initWithFrame:(CGRect)frame {
  self = [super initWithFrame:frame];
  if(self) {
    [self commonInit];
  }
  return self;
}

-(void)commonInit {
  [[NSBundle mainBundle] loadNibNamed:NSStringFromClass(self.class)
  owner:self
  options:nil];
  [self addSubview:self.userSnippetContentView];
}
{% endhighlight %}

<br>

---

### initWithFrame and initWithCoder.
These are two standard methods that you must implement. The commonInit method can be called anything you'd like. I called it that because in this method, you are stating, "Load this nib which happens to have my name [NSStringFromClass(self.class)], AND I declare that I am owner of this nib.
This code snippet only works if your files are named the same. If not, you will need to hardcode the name of your nib file at "loadNibNamed". With this design, you can reuse the majority of this .m file on similar xib files you project has. Pretty neat.


#### Instantiate nib into your view controller add the view into whatever view you want to display in on.

{% highlight objc %}
TRVUserSnippetView *snippetView = [[TRVUserSnippetView alloc] init];
[self.containerView addSubview:snippetView];
{% endhighlight %}

<br>

### Adding Masonry

Pod install Masonry and import the .h file. Looking at the code snippet below, you'll notice Masonry's syntax is intuitive. You call a block method called make constraints and set the top, left, and right edges to your superview.

{% highlight objc %}

#import Masonry.h;

...

[snippetView mas_makeConstraints:^(MASConstraintMaker *make) {
  make.top.equalTo(self.containerView.mas_top);
  make.left.and.right.equalTo(self.containerView);
}];
{% endhighlight %}


![](https://s3-us-west-2.amazonaws.com/leojkwan/images/xib-screenshot5.png)
{: class="responsive-image" style="margin:0 auto;width:75%;" }

Boom. Awesome. Now we have to pass in the our user data model into the nib's text label. Our app has a user bio class with all the properties we want to display on our xib.

### Create a property of your class type and override the setter method.

In our project, we have a class called TRVUser that contains all relevant info about a logged in user.
We want to override the setter method for TRVUser so that when we set a specific user to our nib view, the data immediately gets passed into your nib's text labels, images, etc.


{% highlight objc %}

//TRVUserSnippetView.h
@property (nonatomic, strong) TRVUser *userForThisSnippetView;

...

//TRVUserSnippetView.m

-(void)setUserForThisSnippetView:(TRVUser *)userForThisSnippetView {
  _userForThisSnippetView = userForThisSnippetView;
  self.firstNameLabel.text = userForThisSnippetView.userBio.firstName;
  self.lastNameLabel.text = userForThisSnippetView.userBio.lastName;
  self.oneLinerLabel.text = userForThisSnippetView.userBio.userTagline;
}

{% endhighlight%}

We traverse through our user's "userbio" property, which contains the info we want like name, bio description etc.
Run it again and now you will see:

![](https://s3-us-west-2.amazonaws.com/leojkwan/images/xib-screenshot6.png)
{: class="responsive-image" style="margin:0 auto;width:75%;" }


Repeat this process a couple more times with Masonry.

### This is what we made.
{: class="subtitle-text" }

![](https://s3-us-west-2.amazonaws.com/leojkwan/images/xib-screenshot7.png)
{: class="responsive-image" style="margin:0 auto;width:75%;" }

\\
\\
These constraints were made possible through masonry. The two main points to construct this "stack view" is to first append the top of each subsequent view to the last view's bottom constraint, then set the entire content's view bottom constraint to the last item's bottom constraint.</p>

---
<br>

### Common mistakes I ran into working with masonry.
{: class="subtitle-text" }

- ####Add xib as subview of content view... THEN SET your Masonry constraints.
- ####Add root view to self in your nib .m file
  This one is hard to grasp because the content view you dragged in appears to be at the top of your view hierarchy, at least in the document outline. But you still need to add this view as a subview of self. Just do it.
- ####Make edges equal to 0.
- ####Color your xib backgrounds &amp; use the debug view hierarchy.
\\
\\
![](https://s3-us-west-2.amazonaws.com/leojkwan/images/xib-screenshot8.png)
{: class="responsive-image" style="margin:0 auto;width:75%;" }

<br>
The debugger is so helpful in solving view hierarchical problems. Do not be fooled if you see nothing when your view controller compiles. Color your xibs and debug that view, because it may be very possible that your constraints are just wrong.

Your turn!
{: class="subtitle-text" }
