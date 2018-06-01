import React from 'react'

function EventCollection(props){
    return <h1>HEYO</h1>
    let eventCollection = props.collection;
    let proximity = props.prox;
    let ordering = props.order;
    if (!eventCollection || !proximity || !ordering) {
      return <h1>Uwu We made a fucky wucky!! A wittle fucko boingo! The code monkeys at our headquarters are working VEWY HAWD to fix this!</h1>
    }
    return (
      <Flex mx={[1, 2, -3]} wrap justify="center">
        {eventCollection
          .sort((a, b) => {
            if (proximity) {
              const distToA = this.distanceTo(a.latitude, a.longitude)
                .miles
              const distToB = this.distanceTo(b.latitude, b.longitude)
                .miles
              return distToA - distToB
            } else {
              return ((ordering) ? 1 : -1) * (new Date(a.start) - new Date(b.start))
            }
          })
          .map(event => (
            <EventCard
              {...event}
              distanceTo={
                proximity
                  ? this.distanceTo(event.latitude, event.longitude).miles
                  : null
              }
              key={event.id}
            />
          ))}
      </Flex>
    );
}
