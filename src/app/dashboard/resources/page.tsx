'use client';

import { useState } from 'react';
import { mentalHealthData, Resource } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Gamepad2, Headphones, Newspaper, PlaySquare, BookHeart } from 'lucide-react';
import Image from 'next/image';

const categories = ['All', 'Depression', 'Anxiety', 'Stress', 'Sleep', 'Games', 'Crisis'];

const typeIcons = {
  article: <Newspaper className="h-5 w-5" />,
  video: <PlaySquare className="h-5 w-5" />,
  audio: <Headphones className="h-5 w-5" />,
  guide: <BookHeart className="h-5 w-5" />,
  game: <Gamepad2 className="h-5 w-5" />,
};

export default function ResourcesPage() {
  const [filter, setFilter] = useState('All');

  const filteredResources = filter === 'All'
    ? mentalHealthData.resources
    : mentalHealthData.resources.filter(r => r.category === filter);

  const getImage = (resource: Resource) => {
    const img = PlaceHolderImages.find(p => p.id === resource.image);
    return img || PlaceHolderImages[0];
  };

  return (
    <div className="space-y-8">
        <div className="text-center">
             <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <BookOpen className="h-10 w-10 text-primary" />
             </div>
            <h1 className="text-3xl md:text-4xl font-bold font-headline">Resource Hub</h1>
            <p className="text-muted-foreground mt-2 text-lg max-w-3xl mx-auto">
                Explore a curated collection of videos, articles, relaxation audios, and games to support your mental wellness journey.
            </p>
        </div>
      
      <div className="flex justify-center flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={filter === category ? 'default' : 'outline'}
            onClick={() => setFilter(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredResources.map(resource => {
          const placeholder = getImage(resource);
          return (
          <Card key={resource.title} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="p-0 relative">
                <Image 
                    src={placeholder.imageUrl}
                    alt={resource.title}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                    data-ai-hint={placeholder.imageHint}
                />
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <CardTitle className="text-lg font-semibold font-headline mb-2">{resource.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{resource.description}</p>
            </CardContent>
            <CardFooter className="p-4 bg-secondary/30 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    {typeIcons[resource.type]}
                    <span className="capitalize">{resource.type}</span>
                </div>
                <Button variant="secondary" size="sm">Explore</Button>
            </CardFooter>
          </Card>
        )})}
      </div>
    </div>
  );
}
