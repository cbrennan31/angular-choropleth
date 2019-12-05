import React, { Fragment, useEffect, useState } from 'react';
import './App.css';
import * as topojson from 'topojson-client';
import * as d3 from 'd3';

const width = 960;
const height = 600;

const color = d3
  .scaleThreshold()
  .domain([2, 4, 6, 8, 10])
  .range(d3.schemePurples[6]);

const format = d3.format('');

const path = d3.geoPath();

function App() {
  const [counties, setCounties] = useState(null);
  const [data, setData] = useState(null);
  const [states, setStates] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // fetch all the data
    const fetchData = async () => {
      const unemploymentData = Object.assign(
        new Map(
          await d3.csv(
            'https://gist.githubusercontent.com/mbostock/682b782da9e1448e6eaac00bb3d3cd9d/raw/0e0a145ded8b1672701dc8b2a702e51c648312d4/unemployment.csv',
            ({ id, rate }) => [id, +rate]
          )
        ),
        { title: 'Unemployment rate (%)' }
      );

      setData(unemploymentData);

      const usMapData = await d3.json(
        'https://cdn.jsdelivr.net/npm/us-atlas@1/us/10m.json'
      );

      setCounties(
        topojson.feature(usMapData, usMapData.objects.counties).features
      );

      setStates(
        topojson.mesh(usMapData, usMapData.objects.states, (a, b) => a !== b)
      );

      setIsLoading(false);
    };
    fetchData();
  }, []);

  const countyElements =
    counties &&
    counties.map(county => {
      const title = format(data.get(county.id))
      return (
        <Fragment key={county.id}>
          <path fill={color(data.get(county.id))} d={path(county)} />
          <title>{title}</title>
        </Fragment>
      );
    });

  return (
    <svg width={width} height={height}>
      {!isLoading && (
        <>
          {countyElements}
          <path
            fill="none"
            stroke="white"
            strokeLinejoin="round"
            d={path(states)}
          />
        </>
      )}
    </svg>
  );
}

export default App;
