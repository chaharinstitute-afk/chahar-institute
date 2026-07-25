export interface Testimonial {
  name: string;
  course: string;
  review: string;
  rating: number;
  image: string;
}

export const testimonials: Testimonial[] = [
  { name: "Priya Sharma", course: "B.Ed", review: "Chahar Institute made my B.Ed admission process incredibly smooth. Their counselors guided me at every step, from document verification to university selection.", rating: 5, image: "/testimonials/student1.jpg" },
  { name: "Rahul Verma", course: "MBA (Distance)", review: "I was able to complete my MBA while working full-time. The team at Chahar Institute helped me choose the right university and handle all paperwork.", rating: 5, image: "/testimonials/student2.jpg" },
  { name: "Anita Kumari", course: "D.El.Ed", review: "As a first-generation learner, I had many doubts about distance education. Chahar Institute answered all my questions patiently and helped me get admitted.", rating: 4, image: "/testimonials/student3.jpg" },
  { name: "Vikash Singh", course: "BCA", review: "The fees were very affordable and the admission process was transparent. I got all my documents processed within a week. Highly recommended!", rating: 5, image: "/testimonials/student4.jpg" },
  { name: "Neha Gupta", course: "M.Ed", review: "I wanted to pursue M.Ed for career growth but was confused about universities. Chahar Institute provided expert guidance and I got admitted to a top university.", rating: 5, image: "/testimonials/student5.jpg" },
  { name: "Amit Kumar", course: "BA (Distance)", review: "Completed my BA through distance mode while working. Chahar Institute made it possible with their efficient admission support and follow-up.", rating: 4, image: "/testimonials/student6.jpg" },
];
