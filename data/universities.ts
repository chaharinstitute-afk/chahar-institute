export interface University {
  name: string;
  description: string;
  recognition: string;
  slug: string;
}

export const universities: University[] = [
  { name: "Maharshi Dayanand University", description: "A premier state university offering quality education through distance learning mode in Haryana.", recognition: "UGC Recognized, NAAC Accredited", slug: "mdu" },
  { name: "Kurukshetra University", description: "One of the oldest universities in North India with a rich legacy of academic excellence.", recognition: "UGC Recognized, NAAC A+ Grade", slug: "kuk" },
  { name: "Chaudhary Ranbir Singh University", description: "A progressive university dedicated to providing accessible higher education in Haryana.", recognition: "UGC Recognized", slug: "crsu" },
  { name: "IGNOU", description: "India's largest open university providing flexible and inclusive education across the country.", recognition: "UGC Recognized, NAAC Accredited", slug: "ignou" },
  { name: "Lovely Professional University", description: "A top-ranked private university offering diverse programs through distance education.", recognition: "UGC-DEB Approved", slug: "lpu" },
  { name: "Suresh Gyan Vihar University", description: "A multi-disciplinary university offering online and distance programs across India.", recognition: "UGC Recognized, NAAC Accredited", slug: "sgvu" },
  { name: "Mangalayatan University", description: "A progressive university focused on holistic education and modern teaching methodologies.", recognition: "UGC Recognized", slug: "mangalayatan" },
  { name: "Subharti University", description: "A well-established university offering professional and academic programs through distance mode.", recognition: "UGC-DEB Approved", slug: "subharti" },
  { name: "OPJS University", description: "A dynamic university committed to providing quality education with modern infrastructure.", recognition: "UGC Recognized", slug: "opjs" },
  { name: "Himalayan Garhwal University", description: "Located in the scenic Himalayas, offering quality distance education programs.", recognition: "UGC Recognized", slug: "hgu" },
  { name: "DPG Institute of Technology & Management", description: "A renowned institute offering professional education and training programs.", recognition: "AICTE Approved", slug: "dpg" },
  { name: "Shri Venkateshwara University", description: "A modern university providing accessible education through online and distance modes.", recognition: "UGC Recognized", slug: "svu" },
];
