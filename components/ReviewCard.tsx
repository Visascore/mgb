import { Review } from '@/lib/types';

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="card p-6 h-full flex flex-col">
      <div className="flex gap-1 mb-3" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill={i < review.rating ? '#B08D4F' : '#E1D3B8'}>
            <path d="M10 1l2.6 5.8 6.4.6-4.8 4.2 1.4 6.3L10 14.8l-5.6 3.1 1.4-6.3L1 7.4l6.4-.6z" />
          </svg>
        ))}
      </div>
      <p className="font-body text-sm text-charcoal2 leading-relaxed flex-1">&ldquo;{review.review_text}&rdquo;</p>
      <p className="font-display text-base text-charcoal mt-4">{review.customer_name}</p>
    </div>
  );
}
