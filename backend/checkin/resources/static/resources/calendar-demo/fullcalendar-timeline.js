document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');

  var calendar = new FullCalendar.Calendar(calendarEl, {
    timeZone: 'UTC',
    initialView: 'resourceTimeGridDay',
    aspectRatio: 1.5,
    initial: '2021-04-15',
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'resourceTimeGridDay,resourceTimeGridWeek,resourceTimeGridMonth,resourceTimeGridYear'
    },
    editable: true,
    resourceAreaHeaderContent: 'Rooms',
    // resources: 'https://fullcalendar.io/demo-resources.json?with-nesting&with-colors',
    // events: 'https://fullcalendar.io/demo-events.json?single-day&for-resource-timeline'
    // resources: 'http://localhost:8000/api/calendar/resource/',
    // events: 'http://localhost:8000/api/calendar/availability/?resources=all',
    resources: 'http://localhost:8000/api/calendar/resource/?resources=45ecc298-ecdf-43c5-aeb8-9fed051568a2',
    events: 'http://localhost:8000/api/space/45ecc298-ecdf-43c5-aeb8-9fed051568a2/availability/'
  });

  calendar.render();
});