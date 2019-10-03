import { Component } from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const path = d3.geoPath();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  width = 960;
  height = 600;

  title = 'angular-choropleth';
  color = d3
    .scaleThreshold()
    .domain([2, 4, 6, 8, 10])
    .range(d3.schemePurples[6]);
  format = d3.format('');

  counties;
  data;
  us;

  async ngOnInit() {
    this.data = Object.assign(
      new Map(
        await d3.csv(
          'https://gist.githubusercontent.com/mbostock/682b782da9e1448e6eaac00bb3d3cd9d/raw/0e0a145ded8b1672701dc8b2a702e51c648312d4/unemployment.csv',
          ({ id, rate }) => [id, +rate]
        )
      ),
      { title: 'Unemployment rate (%)' }
    );

    this.us = await d3.json(
      'https://cdn.jsdelivr.net/npm/us-atlas@1/us/10m.json'
    );

    this.counties = topojson.feature(
      this.us,
      this.us.objects.counties
    ).features;

    const svg = d3.select('svg')
      .style('width', this.width)
      .style('height', this.height);

    svg
      .selectAll('path')
      .data(topojson.feature(this.us, this.us.objects.counties).features)
      .join('path')
      .attr('fill', d => this.color(this.data.get(d.id)))
      .attr('d', path)
      .append('title')
      .text(d => this.format(this.data.get(d.id)));

    svg
      .append('path')
      .datum(topojson.mesh(this.us, this.us.objects.states, (a, b) => a !== b))
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-linejoin', 'round')
      .attr('d', path);

    return svg.node();
  }
}
