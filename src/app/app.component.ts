import { Component } from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  // width = 960;
  // height = 600;

  title = 'angular-choropleth';
  color = d3
    .scaleThreshold()
    .domain([2, 4, 6, 8, 10])
    .range(d3.schemePurples[6]);
  format = d3.format('');
  path = d3.geoPath();

  counties;
  data;
  states;

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

    const us = await d3.json('https://cdn.jsdelivr.net/npm/us-atlas@1/us/10m.json');

    this.counties = topojson.feature(us, us.objects.counties).features;
    this.states = topojson.mesh(us, us.objects.states, (a, b) => a !== b);
  }
}
