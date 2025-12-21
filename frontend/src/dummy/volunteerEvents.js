// Dummy data for volunteer events - UI testing purposes

export const volunteerEvents = [
  {
    _id: 'new1',
    name: 'Beach Cleanup Volunteer Day',
    about:
      'Join us for a meaningful day cleaning up our local beaches and protecting marine life. This event is perfect for individuals, families, and groups who want to make a tangible difference in environmental conservation.',
    activities:
      "Volunteers will collect trash and debris from the beach, sort recyclables, document types of waste found, and help restore natural habitats. We'll provide all necessary equipment including gloves, bags, and safety gear.",
    prepare:
      'Wear comfortable clothes that can get dirty, closed-toe shoes, and bring sunscreen, a hat, and a reusable water bottle. We recommend bringing a change of clothes and towel if you plan to swim afterwards.',
    startDate: '2025-11-20T09:00:00.000Z',
    endDate: '2025-11-20T13:00:00.000Z',
    location: 'Santa Monica Beach, 1550 PCH, Santa Monica, CA 90401',
    thumbnail:
      'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&q=80',
    managerId: {
      _id: 'manager20',
      username: 'Ocean Conservation Society',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    },
    registrationsCount: 32,
    category: [
      { _id: 'cat5', name: 'Environment', slug: 'environment' },
      {
        _id: 'cat1',
        name: 'Community Development',
        slug: 'community-development',
      },
      { _id: 'cat6', name: 'Health', slug: 'health' },
    ],
    capacity: 50,
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&q=80',
      'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&q=80',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
      'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80',
    ],
  },
  {
    _id: 'new2',
    name: 'Food Bank Sorting & Distribution',
    about:
      'Help fight hunger in our community by volunteering at the local food bank. We need dedicated volunteers to sort donations, pack boxes, and assist with distribution to families in need.',
    activities:
      'Sort and organize food donations, check expiration dates, pack food boxes for distribution, assist clients during pick-up hours, and help maintain the warehouse organization.',
    prepare:
      'Wear comfortable clothing and closed-toe shoes. Hair should be tied back if long. We provide gloves and aprons. Please avoid wearing strong perfumes or colognes.',
    startDate: '2025-11-25T08:00:00.000Z',
    endDate: '2025-11-25T12:00:00.000Z',
    location: 'Community Food Bank, 456 Maple Street, Los Angeles, CA 90012',
    thumbnail:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
    managerId: {
      _id: 'manager21',
      username: 'LA Food Bank',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    },
    registrationsCount: 18,
    category: [
      { _id: 'cat7', name: 'Hunger', slug: 'hunger' },
      {
        _id: 'cat1',
        name: 'Community Development',
        slug: 'community-development',
      },
    ],
    capacity: 30,
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
      'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
      'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80',
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80',
    ],
  },
  {
    _id: 'new3',
    name: 'Youth Tutoring Program',
    about:
      "Make a difference in a child's education by becoming a volunteer tutor. Help students with homework, reading comprehension, and building confidence in their academic abilities.",
    activities:
      'Provide one-on-one or small group tutoring in math, reading, and science. Assist with homework completion, teach study skills, and mentor students on their educational journey.',
    prepare:
      'Bring your patience, enthusiasm, and any educational materials you find helpful. A background check is required. We provide all necessary textbooks and learning materials.',
    startDate: '2025-12-01T15:00:00.000Z',
    endDate: '2025-12-01T18:00:00.000Z',
    location:
      'Community Learning Center, 789 Education Ave, San Diego, CA 92101',
    thumbnail:
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
    managerId: {
      _id: 'manager22',
      username: 'Emily Rodriguez',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    },
    registrationsCount: 12,
    category: [
      { _id: 'cat8', name: 'Education', slug: 'education' },
      { _id: 'cat9', name: 'Youth', slug: 'youth' },
    ],
    capacity: 20,
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
      'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80',
    ],
  },
  {
    _id: 'new4',
    name: 'Animal Shelter Weekend Care',
    about:
      'Spend your weekend caring for rescued animals at our no-kill shelter. Help provide love, attention, and basic care to dogs and cats waiting for their forever homes.',
    activities:
      'Walk and exercise dogs, clean kennels and cages, feed and water animals, socialize with cats and kittens, assist with basic grooming, and help with adoption events.',
    prepare:
      'Wear old clothes and closed-toe shoes that can get dirty. Long pants recommended. We provide gloves and cleaning supplies. No previous experience needed - training provided.',
    startDate: '2025-12-07T09:00:00.000Z',
    endDate: '2025-12-07T14:00:00.000Z',
    location:
      'Happy Paws Animal Shelter, 321 Pet Lane, San Francisco, CA 94102',
    thumbnail:
      'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80',
    managerId: {
      _id: 'manager23',
      username: 'David Martinez',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    },
    registrationsCount: 25,
    category: [
      { _id: 'cat10', name: 'Animals', slug: 'animals' },
      {
        _id: 'cat1',
        name: 'Community Development',
        slug: 'community-development',
      },
    ],
    capacity: 35,
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80',
      'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=800&q=80',
    ],
  },
  {
    _id: 'new5',
    name: 'Senior Tech Support Day',
    about:
      'Bridge the digital divide by teaching seniors how to use smartphones, tablets, and computers. Help them connect with loved ones, access online services, and navigate the digital world safely.',
    activities:
      'Provide one-on-one tech support, teach basic computer skills, help set up email and social media accounts, explain online safety, and assist with video calling applications.',
    prepare:
      'Bring your patience and a friendly attitude. No special equipment needed - we provide devices for training. Understanding of basic technology required.',
    startDate: '2025-12-10T13:00:00.000Z',
    endDate: '2025-12-10T16:00:00.000Z',
    location: 'Golden Years Senior Center, 555 Elder Ave, Sacramento, CA 95814',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager24',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 15,
    category: [
      { _id: 'cat11', name: 'Seniors', slug: 'seniors' },
      { _id: 'cat8', name: 'Education', slug: 'education' },
    ],
    capacity: 25,
    status: 'approved',
  },
  {
    _id: '1',
    name: "HALLOQWEEN party @ Charlie's Nightclub DENVER",
    description:
      'Join us for an unforgettable Halloween celebration with music, dance, and community fun!.',
    startDate: '2025-10-24',
    location: '900 E Colfax Ave, Denver, CO 80218, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    managerId: {
      _id: 'manager1',
      username: 'AspenOUT Community Fund',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 12,
    category: [
      {
        _id: 'cat1',
        name: 'Community Development',
        slug: 'community-development',
      },
      { _id: 'cat2', name: 'Event Organizer', slug: 'event-organizer' },
    ],
    capacity: 12,
    status: 'approved',
  },
  {
    _id: '2',
    name: 'Dwell Ophan Care: Make Meals for Children in Foster Care',
    description:
      'Help prepare nutritious meals for children in the foster care system.',
    startDate: '2025-10-25',
    location: '130 West 3rd Street, Bloomsburg, PA, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
    managerId: {
      _id: 'manager2',
      username: 'Sarah Johnson',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    },
    registrationsCount: 8,
    category: [
      { _id: 'cat3', name: 'Food', slug: 'food' },
      { _id: 'cat4', name: 'Help', slug: 'help' },
    ],
    status: 'approved',
  },
  {
    _id: '3',
    name: 'Dwell Ophan Care: Organize Donations for Foster Children',
    description: 'Sort and organize donated items for children in foster care.',
    startDate: '2025-10-25',
    location: '130 West 3rd Street, Bloomsburg, PA, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80',
    managerId: {
      _id: 'manager3',
      username: 'Michael Chen',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    },
    registrationsCount: 15,
    category: [{ _id: 'cat4', name: 'Help', slug: 'help' }],
    status: 'approved',
  },
  {
    _id: '4',
    name: 'Beach Cleanup Initiative',
    description:
      'Join us for a community beach cleanup event. Help preserve our coastal ecosystem.',
    startDate: '2025-11-15',
    location: 'Santa Monica Beach, Los Angeles, CA, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&q=80',
    managerId: {
      _id: 'manager4',
      username: 'Ocean Conservation Society',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    },
    registrationsCount: 34,
    category: [
      { _id: 'cat5', name: 'Climate', slug: 'climate' },
      {
        _id: 'cat1',
        name: 'Community Development',
        slug: 'community-development',
      },
    ],
    status: 'approved',
  },
  {
    _id: '5',
    name: 'Youth Mentorship Program',
    description:
      'Become a mentor for at-risk youth in our community. Share your knowledge and skills.',
    startDate: '2025-11-25',
    location: '456 Youth Center Blvd, Seattle, WA, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
    managerId: {
      _id: 'manager5',
      username: 'Emily Rodriguez',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    },
    registrationsCount: 22,
    category: [],
    status: 'approved',
  },
  {
    _id: '6',
    name: 'Animal Shelter Care',
    description:
      'Help care for rescued animals at our local shelter. Perfect for animal lovers.',
    startDate: '2025-12-01',
    location: '789 Shelter Rd, Portland, OR, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80',
    managerId: {
      _id: 'manager6',
      username: 'David Martinez',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    },
    registrationsCount: 18,
    category: [],
    status: 'approved',
  },
  {
    _id: '7',
    name: 'Community Garden Project',
    description:
      'Get your hands dirty building and maintaining a community garden.',
    startDate: '2025-12-05',
    location: '321 Green St, Austin, TX, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
    managerId: {
      _id: 'manager7',
      username: 'Urban Farming Initiative',
      avatar:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80',
    },
    registrationsCount: 45,
    category: [],
    status: 'approved',
  },
  {
    _id: '8',
    name: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing recreational activities and social events.',
    startDate: '2025-12-10',
    location: '555 Elder Ave, Miami, FL, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager8',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 28,
    category: [],
    status: 'approved',
  },
  {
    _id: '9',
    name: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing recreational activities and social events.',
    startDate: '2025-12-10',
    location: '555 Elder Ave, Miami, FL, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager8',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 28,
    category: [],
    status: 'approved',
  },
  {
    _id: '10',
    name: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing recreational activities and social events.',
    startDate: '2025-12-10',
    location: '555 Elder Ave, Miami, FL, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager8',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 28,
    category: [],
    status: 'approved',
  },
  {
    _id: '11',
    name: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing recreational activities and social events.',
    startDate: '2025-12-10',
    location: '555 Elder Ave, Miami, FL, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager8',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 28,
    category: [],
    status: 'approved',
  },
  {
    _id: '12',
    name: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing recreational activities and social events.',
    startDate: '2025-12-10',
    location: '555 Elder Ave, Miami, FL, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager8',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 28,
    category: [],
    status: 'approved',
  },
  {
    _id: '13',
    name: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing recreational activities and social events.',
    startDate: '2025-12-10',
    location: '555 Elder Ave, Miami, FL, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager8',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 28,
    category: [],
    status: 'approved',
  },
  {
    _id: '14',
    name: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing recreational activities and social events.',
    startDate: '2025-12-10',
    location: '555 Elder Ave, Miami, FL, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager8',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 28,
    category: [],
    status: 'approved',
  },
  {
    _id: '15',
    name: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing recreational activities and social events.',
    startDate: '2025-12-10',
    location: '555 Elder Ave, Miami, FL, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager8',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 28,
    category: [],
    status: 'approved',
  },
  {
    _id: '16',
    name: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing recreational activities and social events.',
    startDate: '2025-12-10',
    location: '555 Elder Ave, Miami, FL, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager8',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 28,
    category: [],
    status: 'approved',
  },
  {
    _id: '17',
    name: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing recreational activities and social events.',
    startDate: '2025-12-10',
    location: '555 Elder Ave, Miami, FL, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager8',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 28,
    category: [],
    status: 'approved',
  },
  {
    _id: '18',
    name: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing recreational activities and social events.',
    startDate: '2025-12-10',
    location: '555 Elder Ave, Miami, FL, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager8',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 28,
    category: [],
    status: 'approved',
  },
  {
    _id: '19',
    name: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing recreational activities and social events.',
    startDate: '2025-12-10',
    location: '555 Elder Ave, Miami, FL, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager8',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 28,
    category: [],
    status: 'approved',
  },
  {
    _id: '20',
    name: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing recreational activities and social events.',
    startDate: '2025-12-10',
    location: '555 Elder Ave, Miami, FL, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager8',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 28,
    category: [],
    status: 'approved',
  },
  {
    _id: '21',
    name: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing recreational activities and social events.',
    startDate: '2025-12-10',
    location: '555 Elder Ave, Miami, FL, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager8',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 28,
    category: [],
    status: 'approved',
  },
  {
    _id: '22',
    name: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing recreational activities and social events.',
    startDate: '2025-12-10',
    location: '555 Elder Ave, Miami, FL, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager8',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 28,
    category: [],
    status: 'approved',
  },
  {
    _id: '23',
    name: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing recreational activities and social events.',
    startDate: '2025-12-10',
    location: '555 Elder Ave, Miami, FL, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager8',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 28,
    category: [],
    status: 'approved',
  },
  {
    _id: '24',
    name: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing recreational activities and social events.',
    startDate: '2025-12-10',
    location: '555 Elder Ave, Miami, FL, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager8',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 28,
    category: [],
    status: 'approved',
  },
  {
    _id: '25',
    name: 'Senior Center Activities',
    description:
      'Bring joy to seniors by organizing recreational activities and social events.',
    startDate: '2025-12-10',
    location: '555 Elder Ave, Miami, FL, USA',
    thumbnail:
      'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80',
    managerId: {
      _id: 'manager8',
      username: 'Jessica Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    registrationsCount: 28,
    category: [],
    status: 'approved',
  },
];

// Single event for testing
export const singleVolunteerEvent = {
  _id: '7',
  name: 'Habitat for Humanity Build',
  description:
    'Help build affordable housing for families in need. No construction experience required - we provide training and all necessary tools. Be part of making homeownership dreams come true.',
  startDate: '2025-12-15',
  thumbnail:
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
  managerId: {
    _id: 'manager9',
    username: 'Habitat for Humanity',
    avatar: null,
  },
  registrationsCount: 0,
  category: [],
  status: 'approved',
};

// Events with different date formats for testing
export const volunteerEventsVariedDates = [
  {
    _id: '8',
    name: 'Library Reading Program',
    description:
      'Read to children and help foster a love of literacy. Perfect for educators, parents, or anyone passionate about childhood education and reading.',
    startDate: new Date('2025-11-18'),
    thumbnail:
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80',
    managerId: {
      _id: 'manager10',
      username: 'City Library',
      avatar: null,
    },
    registrationsCount: 0,
    category: [],
    status: 'approved',
  },
  {
    _id: '9',
    name: 'Environmental Tree Planting',
    description:
      'Join our reforestation effort and help plant trees to combat climate change. Learn about native species while contributing to a greener future.',
    startDate: '2025-12-20T10:00:00Z',
    thumbnail:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
    managerId: {
      _id: 'manager11',
      username: 'Green Earth Foundation',
      avatar: null,
    },
    registrationsCount: 0,
    category: [],
    status: 'approved',
  },
];

export default volunteerEvents;
