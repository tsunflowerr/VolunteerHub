// Dummy data for volunteer events - UI testing purposes

export const volunteerEvents = [
  {
    _id: '1',
    title: 'Beach Cleanup Initiative',
    description:
      'Join us for a community beach cleanup event. Help preserve our coastal ecosystem by removing plastic waste and debris. All supplies provided, just bring your enthusiasm and commitment to environmental conservation.',
    date: '2025-11-15',
    image:
      'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&q=80',
  },
  {
    _id: '2',
    title: 'Food Bank Distribution',
    description:
      'Volunteer at our local food bank to help sort, pack, and distribute food to families in need. Your time can make a real difference in fighting hunger in our community. No experience necessary.',
    date: '2025-11-20',
    image:
      'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
  },
  {
    _id: '3',
    title: 'Youth Mentorship Program',
    description:
      'Become a mentor for at-risk youth in our community. Share your knowledge, skills, and life experience to help guide young people toward a brighter future. Flexible scheduling available.',
    date: '2025-11-25',
    image:
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
  },
  {
    _id: '4',
    title: 'Animal Shelter Care',
    description:
      'Help care for rescued animals at our local shelter. Tasks include feeding, walking dogs, socializing cats, and general facility maintenance. Perfect for animal lovers looking to give back.',
    date: '2025-12-01',
    image:
      'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80',
  },
  {
    _id: '5',
    title: 'Community Garden Project',
    description:
      'Get your hands dirty building and maintaining a community garden that provides fresh produce to local families. Learn sustainable gardening practices while helping combat food insecurity.',
    date: '2025-12-05',
    image:
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
  },
  {
    _id: '6',
    title: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing and participating in recreational activities, games, and social events. Help combat loneliness and create meaningful connections with elderly community members.',
    date: '2025-12-10',
    image:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
  },
];

// Single event for testing
export const singleVolunteerEvent = {
  _id: '7',
  title: 'Habitat for Humanity Build',
  description:
    'Help build affordable housing for families in need. No construction experience required - we provide training and all necessary tools. Be part of making homeownership dreams come true.',
  date: '2025-12-15',
  image:
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
};

// Events with different date formats for testing
export const volunteerEventsVariedDates = [
  {
    _id: '8',
    title: 'Library Reading Program',
    description:
      'Read to children and help foster a love of literacy. Perfect for educators, parents, or anyone passionate about childhood education and reading.',
    date: new Date('2025-11-18'),
    image:
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80',
  },
  {
    _id: '9',
    title: 'Environmental Tree Planting',
    description:
      'Join our reforestation effort and help plant trees to combat climate change. Learn about native species while contributing to a greener future.',
    date: '2025-12-20T10:00:00Z',
    image:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
  },
];

export default volunteerEvents;
