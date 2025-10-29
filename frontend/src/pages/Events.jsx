import { useState } from 'react';
import Hero from '../components/Hero/Hero.jsx';
import EventList from '../components/EventCard/EventList.jsx';
import { volunteerEvents } from '../dummy/volunteerEvents';
import { Pagination } from '@mui/material';
import { FileX } from 'lucide-react';
const Events = () => {
  const [events, setEvents] = useState(volunteerEvents);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(12);

  //get current events
  const totalEvents = events.length;
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  //change page
  const handleChangePage = (e, value) => setCurrentPage(value);
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Hero></Hero>
      <EventList events={currentEvents}></EventList>
      <Pagination
        count={Math.ceil(totalEvents / eventsPerPage)}
        shape="rounded"
        sx={{
          padding: '10px',
        }}
        page={currentPage}
        onChange={handleChangePage}
      />
    </div>
  );
};

export default Events;
