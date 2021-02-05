var resources_fullcalendar = {
    parameters: {
        resources_uuids: [],
        last_added_resource: null,
    },
    init: function(parameters, config_overwrite) {
        document.addEventListener('DOMContentLoaded', function () {
            resources_fullcalendar.parameters = parameters
            var calendarEl = document.getElementById('calendar')
            var resources_fullcalendar_base_config = {
                initialView: 'resourceTimelineDay',
                schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
                headerToolbar: {
                    start: 'title',
                    center: '',
                    end: 'today prev,next resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth,resourceTimelineYear'
                },
                initialDate: resources_fullcalendar.parameters.initialDate,
                eventSources: [{
                    url: '/api/calendar/event/?all=true',
                    method: 'GET',
                    failure: function () {
                        resources_fullcalendar.parameters.resources_uuids.pop(resources_fullcalendar.parameters.last_added_resource);
                        resources_fullcalendar.parameters.last_added_resource = null;
                        calendar.addResource({
                            title: "Nicht gefunden",
                            id: "NOT_FOUND"
                        });
                        setTimeout(() => {
                            calendar.getResourceById('NOT_FOUND').remove()
                        }, 2000);
                    },
                    success: function () {
                        calendar.refetchResources()
                    }
                }, [
                    {
                        start: resources_fullcalendar.parameters.start,
                        end: resources_fullcalendar.parameters.end,
                        display: 'background'
                    }
                ]],
                resources: {
                    url: '/api/calendar/resource/',
                    method: 'GET',
                    extraParams: function () {
                        return {resources: resources_fullcalendar.parameters.resources_uuids.join('.')}
                    },
                },
                resourceOrder: 'index,title,id',
                resourceGroupField: 'unit_name',
                resourceAreaColumns: [
                    {
                        field: 'name',
                        headerContent: 'Space',
                    },
                    {
                        field: 'display_numbers',
                        headerContent: 'Number',
                        width: "30%",
                    },
                    {
                        field: 'capacity',
                        headerContent: 'Cap.',
                        width: "20%",
                    }
                ],
                // weekNumbers: true,
                nowIndicator: true,
                businessHours: {
                    // days of week. an array of zero-based day of week integers (0=Sunday)
                    daysOfWeek: [1, 2, 3, 4, 5], // Monday - Thursday
                    startTime: '10:00', // a start time (10am in this example)
                    endTime: '20:00', // an end time (6pm in this example)
                },
            }
            var calendar = new FullCalendar.Calendar(calendarEl, {...resources_fullcalendar_base_config, ...config_overwrite});
            calendar.render();
            django.jQuery(document.querySelector('#id_resource')).on('change', (event) => {
                var uuid = event.target.value;
                if (uuid && !resources_fullcalendar.parameters.resources_uuids.includes(uuid)) {
                    resources_fullcalendar.parameters.resources_uuids.push(uuid);
                    resources_fullcalendar.parameters.last_added_resource = uuid;
                    calendar.refetchEvents();
                }
            });
        });
    }
}