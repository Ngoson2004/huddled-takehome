<script lang="ts">
  let { artistEngagement } = $props();
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import moment from "moment-timezone";

  function formatDuration(duration: number): string {
    const hours = Math.floor(duration / 3600) % 24;
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    return `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  onMount(() => {
    // Specify the chart’s dimensions.
    const width = 1500;
    const height = 600;
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 20;
    const marginLeft = 20;

    const svg = d3
      .select("#engagement-viz")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "width: auto; max-width: 100%; height: auto;");

    // console.log(moment.utc(formatDuration(86400*3 + 3600), "HH:mm:ss").tz("America/New_York").format("HH"));

    const data = artistEngagement.map(
      (d: {
        artist_id: string;
        event_type: string;
        created_at: number;
        timezone: string;
      }) => ({
        artist_id: String(d.artist_id),
        hour: moment
          .utc(formatDuration(d.created_at), "HH:mm:ss")
          .tz(d.timezone)
          .format("HH"),
        points: d3
          .scaleOrdinal<number>()
          .domain([
            "play_track",
            "hover_artist_name",
            "like_track",
            "add_track_to_playlist",
            "follow_artist",
            "share_artist",
            "share_track",
          ])
          .range([1, 1, 2, 2, 2, 3, 3])(d.event_type),
      })
    );

    console.log(data);

    // Aggregate points for each artist and moment
    const aggregatedData = d3.rollup(
      data as { artist_id: string; hour: string; points: number }[],
      (v) => d3.sum(v, (d) => d.points),
      (d) => d.artist_id,
      (d) => d.hour
    );

    console.log(aggregatedData);

    // Convert aggregated data to a flat array for visualization
    const flatData = [];
    for (const [artist_id, hour] of aggregatedData) {
      for (const [hr, points] of hour) {
        flatData.push({ artist_id: artist_id, hr: hr, points: points });
      }
    }

    console.log(flatData);

    // Grouped bar chart

    // const artists = new Set(flatData.map((d) => d.artist_id));
    // const hours = new Set(flatData.map((d) => d.hr));

    // const colorScale = d3
    //   .scaleSequential(d3.interpolateBlues)
    //   .domain([0, hours.size]);

    // const color = d3
    //   .scaleOrdinal()
    //   .domain(hours)
    //   .range(Array.from(hours).map((_, i) => colorScale(i)))
    //   .unknown("#ccc");

    // const fx = d3
    //   .scaleBand()
    //   .domain(artists)
    //   .rangeRound([marginLeft, width - marginRight])
    //   .paddingInner(0.025);

    // const x = d3
    //   .scaleBand()
    //   .domain(hours)
    //   .rangeRound([0, fx.bandwidth()])
    //   .padding(0);

    // const y = d3
    //   .scaleLinear()
    //   .domain([0, d3.max(flatData, (d) => d.points) as number])
    //   .nice()
    //   .range([height - marginBottom, marginTop]);

    // svg
    //   .append("g")
    //   .selectAll()
    //   .data(d3.group(flatData, (d) => d.artist_id))
    //   .join("g")
    //   .attr("transform", ([artist_id]) => `translate(${fx(artist_id)},0)`)
    //   .selectAll()
    //   .data(([, d]) => d)
    //   .join("rect")
    //   .attr("x", (d) => x(d.hr))
    //   .attr("y", (d) => y(d.points))
    //   .attr("width", x.bandwidth()+5)
    //   .attr("height", (d) => y(0) - y(d.points))
    //   .attr("fill", (d) => color(d.hr) as string);

    // Stacked bar chart
    const nestedData = d3.group(flatData, (d) => d.artist_id);
    const stackKeys = Array.from(new Set(flatData.map((d) => d.hr)));

    const stackData = Array.from(nestedData, ([artist_id, values]) => {
      const result: any = { artist_id };
      values.forEach((d) => {
        result[d.hr] = d.points;
      });
      return result;
    });

    // Create the stack generator
    const stack = d3
      .stack()
      .keys(stackKeys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const series = stack(stackData);

    const artists = Array.from(new Set(flatData.map((d) => d.artist_id)));
    const hours = Array.from(new Set(flatData.map((d) => d.hr)));

    const fx = d3
      .scaleBand()
      .domain(artists)
      .rangeRound([marginLeft, width - marginRight])
      .paddingInner(0.1);

    const x = d3
      .scaleBand()
      .domain(hours)
      .rangeRound([0, fx.bandwidth()])
      .padding(0.05);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1])) as number])
      .nice()
      .rangeRound([height - marginBottom, marginTop]);

    const colorScale = d3
      .scaleSequential(d3.interpolateSpectral)
      .domain([0, hours.length]);

    const color = d3
      .scaleOrdinal()
      .domain(hours)
      //   .range(d3.schemeCategory10)
      .range(Array.from(hours).map((_, i) => colorScale(i)))
      .unknown("#ccc");

    svg
      .append("g")
      .selectAll("g")
      .data(series)
      .join("g")
      .attr("fill", (d) => color(d.key))
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("x", (d) => fx(d.data.artist_id)!)
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", fx.bandwidth());

    // Append the horizontal axis.
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(fx).tickSizeOuter(0))
      .call((g) => g.selectAll(".domain").remove());

    // Append the vertical axis.
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(null, "s"))
      .call((g) => g.selectAll(".domain").remove());

    // Create a legend group
    const legend = svg.append("g").attr("transform", `translate(0,0)`);

    // Add legend items
    hours.forEach((hour, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(${i * 23}, 0)`);

      legendRow
        .append("rect")
        .attr("width", 30)
        .attr("height", 18)
        .attr("fill", color(hour));

      legendRow
        .append("text")
        .attr("x", 0)
        .attr("y", 30)
        .attr("dx", "0.3em")
        .attr("font-size", "10px")
        .text(i + "h");
    });
  });

  //28 or 18 has a large fraction of morning listeners
  //38 has a large fraction of afternoon listeners
  //39 has a large fraction of evening listeners
</script>

<div class="overflow-x-auto">
  <div
    class="min-w-max w-[60rem] h-[60rem] overflow-y-auto relative scrollbar-pretty bg-green-100"
  >
    <div id="engagement-viz"></div>
  </div>
</div>
