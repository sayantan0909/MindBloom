'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Plus, ThumbsUp, Users } from 'lucide-react';

const mockPosts = {
  general: [
    { id: 1, author: "Peer Supporter", time: "2 hours ago", title: "Weekly Check-in Thread", content: "How is everyone doing this week? Remember, it's okay to not be okay. Share what's on your mind.", likes: 23, replies: 15 },
    { id: 2, author: "Anonymous Student", time: "8 hours ago", title: "Feeling a bit lost", content: "Just moved to campus and finding it hard to connect with people. Any advice on making friends in a new place?", likes: 18, replies: 7 },
  ],
  academic: [
    { id: 3, author: "Anonymous Student", time: "1 day ago", title: "Feeling overwhelmed with assignments", content: "I've been struggling to keep up with my coursework and feeling really stressed. Has anyone found effective ways to manage multiple deadlines?", likes: 35, replies: 12 },
    { id: 4, author: "Study Buddy", time: "2 days ago", title: "Study group success story", content: "Just wanted to share that forming a study group really helped me with both my grades and my anxiety. Don't be afraid to reach out to classmates!", likes: 42, replies: 9 },
  ],
  social: [
    { id: 5, author: "Anonymous Student", time: "4 hours ago", title: "Social anxiety at parties", content: "I want to go out more but I get really anxious in big groups. How do others deal with this?", likes: 28, replies: 11 },
  ],
};

type Post = (typeof mockPosts.general)[0];

const PostCard = ({ post }: { post: Post }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-headline">{post.title}</CardTitle>
      <CardDescription>by {post.author} • {post.time}</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">{post.content}</p>
    </CardContent>
    <CardContent className="flex gap-4">
      <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
        <ThumbsUp className="h-4 w-4" /> {post.likes}
      </Button>
      <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
        <MessageCircle className="h-4 w-4" /> {post.replies} Replies
      </Button>
    </CardContent>
  </Card>
);

export default function PeerSupportPage() {
    const [showNewPostForm, setShowNewPostForm] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would submit the form data
        alert('Your post has been submitted anonymously and will be visible after moderation.');
        setShowNewPostForm(false);
        (e.target as HTMLFormElement).reset();
    };

  return (
    <div className="space-y-8">
      <div className="text-center">
             <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <Users className="h-10 w-10 text-primary" />
             </div>
        <h1 className="text-3xl md:text-4xl font-bold font-headline">Peer Support Forum</h1>
        <p className="text-muted-foreground mt-2 text-lg max-w-3xl mx-auto">
          Connect with fellow students in a safe, anonymous, and moderated space. Share experiences and support each other.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <div className="flex justify-between items-center mb-4">
            <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="academic">Academic</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>
            <Button onClick={() => setShowNewPostForm(!showNewPostForm)}>
                <Plus className="mr-2 h-4 w-4" /> New Post
            </Button>
        </div>

        {showNewPostForm && (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Create a New Post</CardTitle>
                    <CardDescription>Your post is anonymous. Please be respectful and avoid sharing personal information.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <Input placeholder="Post Title" required />
                        <Textarea placeholder="Share what's on your mind..." required rows={5}/>
                    </CardContent>
                    <CardContent className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setShowNewPostForm(false)}>Cancel</Button>
                        <Button type="submit">Submit Post</Button>
                    </CardContent>
                </form>
            </Card>
        )}

        <TabsContent value="general">
          <div className="space-y-4">
            {mockPosts.general.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        </TabsContent>
        <TabsContent value="academic">
          <div className="space-y-4">
            {mockPosts.academic.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        </TabsContent>
        <TabsContent value="social">
          <div className="space-y-4">
            {mockPosts.social.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
