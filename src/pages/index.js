import React, { Component, Fragment } from 'react'
import Helmet from 'react-helmet'
import axios from 'axios'
import {
  Box,
  Container,
  Flex,
  Text,
  Image,
  Link as L,
  Heading,
  Section,
  Button,
} from '@hackclub/design-system'
import EventCard from 'components/EventCard'
import EmailListForm from 'components/EmailListForm'
import { distance, trackClick } from 'utils'
import styled from 'styled-components'

const StyledLink = L.extend`
  color: ${props => props.theme.colors.primary};
  &:hover {
    text-decoration: underline;
  }
`

const Link = props => <StyledLink {...props} onClick={trackClick(props)} />

const HideOnMobile = Box.extend`
  display: none;
  ${props => props.theme.mediaQueries.sm} {
    display: unset;
  }
`

const timeFilters = {
  'future': {
    name: 'in the future',
    function: event => new Date(event.start) >= new Date(Date.now() - 864e5),
  },
  'past': {
    name: 'in the past',
    function: event => new Date(event.start) < new Date(Date.now() - 864e5)
  }
}

/**
Legacy card layout

<Flex mx={[1, 2, -3]} wrap justify="center">
  {filteredEvents['past']
    .sort((a, b) => {
      if (sortByProximity) {
        const distToA = this.distanceTo(a.latitude, a.longitude)
          .miles
        const distToB = this.distanceTo(b.latitude, b.longitude)
          .miles
        return distToA - distToB
      } else {
        return new Date(b.start) - new Date(a.start)
      }
    })
    .map(event => (
      <EventCard
        {...event}
        distanceTo={
          sortByProximity
            ? this.distanceTo(event.latitude, event.longitude).miles
            : null
        }
        key={event.id}
      />
    ))}
</Flex>
*/

const filteredEvents = {}

function EventList(props) {
  let output = <h1>Hello</h1>
  try {
    output = (
      <Flex mx={[1, 2, -3]} wrap justify="center">
        {filteredEvents[props.filter]
          .sort((a, b) => {
            (new Date(a.start) - new Date(b.start))
            }
          )
          .map(event => (
            <EventCard
              {...event}
              key={event.id}
            />
          ))}
      </Flex>
    );
  } catch (e) {output = <h1>Something went wrong, please reload the page</h1>}

  return output
}

export default class extends Component {
  constructor(props) {
    super(props)

    this.events = props.data.allEventsJson.edges.map(({ node }) => node)

    Object.keys(timeFilters).forEach(key => {
      filteredEvents[key] = this.events.filter(timeFilters[key].function)
    })

    this.state = {
      filteredEvents,
      searchLat: null || props.searchLat,
      searchLng: null || props.searchLng,
      formattedAddress: undefined,
      sortByProximity: false,
    }

    this.stats = {
      total: this.events.length,
      state: new Set(this.events.map(event => event.parsed_state)).size,
      country: new Set(this.events.map(event => event.parsed_country)).size,
    }
  }

  setCurrentLocation() {
    const geo = window.navigator.geolocation
    if (geo) {
      geo.getCurrentPosition(
        pos => {
          axios
            .get(
              `https://maps.google.com/maps/api/geocode/json?latlng=${
                pos.coords.latitude
              },${pos.coords.longitude}`
            )
            .then(resp => {
              const { results } = resp.data
              const newState = {
                searchLat: pos.coords.latitude,
                searchLng: pos.coords.longitude,
                sortByProximity: true,
              }
              if (results.length > 0) {
                const formattedAddress = (
                  results.find(
                    result => result.types.indexOf('neighborhood') !== -1
                  ) || results[0]
                ).formatted_address
                newState.formattedAddress = formattedAddress
              }
              this.setState(newState)
            })
        },
        err => {
          alert(
            'We couldn’t get your current location. We can only sort by date'
          )
        }
      )
    } else {
      alert('We couldn’t get your current location. We can only sort by date')
    }
  }

  searchLocation() {
    const { searchAddress } = this.state
    if (searchAddress === '') {
      this.setState({
        searchLat: undefined,
        searchLng: undefined,
        formattedAddress: undefined,
      })
    } else {
      axios
        .get(
          `https://maps.google.com/maps/api/geocode/json?address=${encodeURI(
            searchAddress
          )}`
        )
        .then(res => res.data.results[0])
        .then(firstResult => {
          if (firstResult) {
            this.setState({
              searchLat: firstResult.geometry.location.lat,
              searchLng: firstResult.geometry.location.lng,
              formattedAddress: firstResult.formatted_address,
            })
          }
        })
    }
  }

  render() {
    const {
      formattedAddress,
      filteredEvents,
      sortByProximity,
    } = this.state
    return (
      <Fragment>
        <Box>
          <a href="https://hackclub.com" target="_blank">
            <Image src="/flag.svg" width={128} ml={[3, 4, 5]} />
          </a>
          <Flex
            py={3}
            pr={[3, 4, 5]}
            style={{ position: 'absolute', top: 0, right: 0 }}
          >
            <L
              href="https://goo.gl/forms/ZdVkkunalNGW9nQ82"
              target="_blank"
              color="slate"
            >
              Add your event
            </L>
            <Text.span px={[2, 3]} />
            <L
              href="https://github.com/hackclub/hackathons"
              target="_blank"
              color="slate"
            >
              <HideOnMobile>Contribute on</HideOnMobile> GitHub
            </L>
          </Flex>
          <Container maxWidth={36} px={3} align="center">
            <Heading.h1 f={[5, null, 6]} mt={[4, 5]} mb={3}>
              Upcoming High School Hackathons in {new Date().getFullYear()}
            </Heading.h1>
            <Text mb={4} f={4} style={{ maxWidth: '800px' }} mx="auto">
              Find, register, and compete in {this.stats.total} free student-led
              hackathons across {this.stats.state} states + {this.stats.country}{' '}
              countries.
            </Text>
            <EmailListForm location={formattedAddress} />

          </Container>
          <Container px={3}>
            <EventList filter="future" proximity={(sortByProximity)?"yes":"no"} order="yes"/>
            <br/>
            <Text f={4} mx="auto" align="center">
              These events have already happened
            </Text>
            <br/>
            <EventList filter="past" proximity={(sortByProximity)?"yes":"no"} order="no"/>
          </Container>
        </Box>
        <Container maxWidth={40} px={[2, 3]} py={5} align="center">
          <Text f={3} my={4} color="black">
            This directory is maintained by{' '}
            <Link href="//hackclub.com">Hack Club</Link>, a non-profit network
            of student-led computer science clubs.
          </Text>
          <Text f={3} color="black">
            Want to run your own hackathon? Do it with the support of{' '}
            <Link href="https://mlh.io/event-membership" target="_blank">
              MLH
            </Link>.
          </Text>
        </Container>
      </Fragment>
    )
  }
}

export const pageQuery = graphql`
  query PageQuery {
    allEventsJson {
      edges {
        node {
          id
          startHumanized: start(formatString: "MMMM D")
          endHumanized: end(formatString: "D")
          start
          end
          startYear: start(formatString: "YYYY")
          parsed_city
          parsed_state
          parsed_state_code
          parsed_country
          parsed_country_code
          name
          website: website_redirect
          latitude
          longitude
          banner
          logo
          mlh: mlh_associated
        }
      }
    }
  }
`
