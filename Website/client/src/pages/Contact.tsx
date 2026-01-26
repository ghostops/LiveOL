import { useEffect, useState } from 'react';
import MarkdownContent from '../components/MarkdownContent';
import { fetchContent } from '../lib/api';
import Loading from '@/components/Loading';

export default function Contact() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent('contact')
      .then((data) => {
        setContent(data.content);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load content:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Loading />
    );
  }

  return <MarkdownContent content={content} />;
}
