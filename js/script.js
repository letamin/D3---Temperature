const svg = d3.select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

const render = data => {
    const chartData = initializeChart();
    const { xValue, yValue, margin, innerWidth, innerHeight } = chartData;

    const scales = scale(innerWidth, innerHeight, data, xValue, yValue);
    const { xScale, yScale } = scales;

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    addingAxes(xScale, yScale, innerWidth, innerHeight, g);
    addingTitle(g, innerWidth);

    const line = d3.line()
        .x(d => xScale(xValue(d)))
        .y(d => yScale(yValue(d)))
        .curve(d3.curveBasis) // curve the joins between the lines

    g.append('path')
        .attr('class', 'chart-line')
        .attr('d', line(data))
};

//Adding the X and Y axes and their labels
const addingAxes = (xScale, yScale, innerWidth, innerHeight, g) => {
    const xAxisLabel = 'Time';
    const yAxisLabel = 'Temperature';

    const xAxis = d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickPadding(10);

    const yAxis = d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickPadding(10);

    const yAxisG = g.append('g').call(yAxis);

    yAxisG.select('.domain').remove();
    yAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', -40)
        .attr('x', -innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('transform', `rotate(-90)`)
        .text(yAxisLabel);

    const xAxisG = g.append('g').call(xAxis)
        .attr('transform', `translate(0,${innerHeight})`);

    xAxisG.select('.domain').remove();
    xAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', 50)
        .attr('x', innerWidth / 2)
        .text(xAxisLabel);
}

//Initialize some data for our chart
const initializeChart = () => {
    const xValue = d => d.timestamp;
    const yValue = d => d.temperature;
    const margin = { top: 120, right: 40, bottom: 88, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    return { xValue, yValue, margin, innerWidth, innerHeight }
}

//Adding the title for our chart
const addingTitle = (g, innerWidth) => {
    const title = 'Temperature in San Francisco';
    g.append('text')
        .attr('class', 'title')
        .attr('y', -20)
        .attr('x', innerWidth / 3)
        .text(title);
}

//Scales the values from our data to the screen
const scale = (innerWidth, innerHeight, data, xValue, yValue) => {
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, xValue)) // d3.extent returns [min, max] in a single pass over the input: https://observablehq.com/@d3/d3-extent#:~:text=max%2C%20which%20returns%20the%20maximum,to%20set%20a%20scale's%20domain.&text=max%20is%20that%20d3.
        .range([0, innerWidth])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([14, d3.max(data, yValue)])
        .range([innerHeight, 0])

    return { xScale, yScale }
}

d3.csv('../data/data.csv')  //data is taken from https://grayarea.org/initiative/data-canvas-sense-your-city/
    .then(data => {
        data.forEach(row => {
            row.temperature = +row.temperature;
            row.timestamp = new Date(row.timestamp)
        });
        render(data);
    });

