import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
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
  const [us, setUs] = useState(null);
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

      await setData(unemploymentData);

      const usMapData = await d3.json(
        'https://cdn.jsdelivr.net/npm/us-atlas@1/us/10m.json'
      );

      await setUs(usMapData);

      await setCounties(
        topojson.feature(usMapData, usMapData.objects.counties).features
      );

      setIsLoading(false);
    };
    fetchData();
  }, []);

  useEffect(
    () => {
      if (!isLoading) {
      // draw chart 
        const svg = d3
          .select('svg')
          .style('width', width)
          .style('height', height);

        svg
          .selectAll('path')
          .data(topojson.feature(us, us.objects.counties).features)
          .join('path')
          .attr('fill', d => color(data.get(d.id)))
          .attr('d', path)
          .append('title')
          .text(d => format(data.get(d.id)));

        svg
          .append('path')
          .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
          .attr('fill', 'none')
          .attr('stroke', 'white')
          .attr('stroke-linejoin', 'round')
          .attr('d', path);

        return svg.node();
      }
    },
    [isLoading]
  );

  return <svg />;
}

export default App;
