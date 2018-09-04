

// draw a grid


function gridData() {
    var data = new Array();
    var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
    var ypos = 1;
    var width = 18;
    var height = 18;


    // iterate for rows
    for (var row = 0; row < 76; row++) {
        data.push( new Array() );

        // iterate for cells/columns inside rows
        for (var column = 0; column < 104; column++) {
            data[row].push({
                x: xpos,
                y: ypos,
                width: width,
                height: height,

            })
            // increment the x position. I.e. move it over by 50 (width variable)
            xpos += width;
        }
        // reset the x position after a row is complete
        xpos = 1;
        // increment the y position for the next row. Move it down 50 (height variable)
        ypos += height;
    }
    return data;
}

var gridData = gridData();


var grid = d3.select("#grid")
    .append("svg")
    .attr('id','svg')
    .attr("width","100%")
    .attr("height","900px");

var row = grid.selectAll(".row")
    .data(gridData)
    .enter().append("g")
    .attr("class", "row");

var column = row.selectAll(".square")
    .data(function(d) { return d; })
    .enter().append("rect")
    .attr("class","square")
    .attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; })
    .attr("width", function(d) { return d.width; })
    .attr("height", function(d) { return d.height; })
    .style("fill", "#fff")
    .style("stroke", "#f0f2f3")



// end of grid


let svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    node,
    link;

svg.append('defs').append('marker')
    .attrs({'id':'arrowhead',
        'viewBox':'-0 -5 10 10',
        'refX':10,
        'refY':0,
        'orient':'auto',
        'markerWidth':13,
        'markerHeight':13,
        'xoverflow':'visible'})
    .append('svg:path')
    .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
    .attr('fill', '#111213')
    .style('stroke','none');

let simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) {return d.id;}).distance(null).strength(null))
    .force('x', d3.forceX().x(function(d){return d.position.x}))
    .force('y', d3.forceY().y(function(d){return d.position.y}))
    .force("charge", null)
    .force("center", null);



d3.json("https://api.myjson.com/bins/pqnto", function (error, graph) {
    if (error) throw error;
    update(graph.connections, graph.nodes);
    console.log(graph.nodes);
});

function update(connections, nodes) {
    link = svg.selectAll(".link")
        .data(connections)
        .enter()
        .append("line")
        .attr("class", "link")
        .attr('fill','#d8d9da')
        .attr('stroke-width','1')
        .attr('marker-end','url(#arrowhead)')

    link.append("title")
        .text(function (d) {return d.type;});


    edgepaths = svg.selectAll(".edgepath")
        .data(connections)
        .enter()
        .append('path')
        // .attr("transform", "translate(" + (70) + "," + 20 + ")")

        .attrs({
            'class': 'edgepath',
            'fill-opacity': 0,
            'stroke-opacity': 0,
            'id': function(d, i) {return 'edgepath' + i
            }
        })
        .style("pointer-events", "none");

    edgelabels = svg.selectAll(".edgelabel")
        .data(connections)
        .enter()
        .append('text')
        .style("pointer-events", "none")
        .attrs({
            'class': 'edgelabel',
            'id': function (d, i) {return 'edgelabel' + i},
            'font-size': 15,
            'fill': '#828283'
        });

    edgelabels.append('textPath')
        .attr('xlink:href', function (d, i) {return '#edgepath' + i})
        .style("text-anchor", "middle")
        .style("pointer-events", "none")
        .attr('dx', '10')
        .attr("startOffset", "70%")
        .attr("transform", "translate(" + (-310)+ "," + 150 + ")")

        .text(function (d) {return d.type});

    node = svg.selectAll(".node")
        .data(nodes)
        .enter()
        .append("g").attr("class", "node")
         .attr('x', d => d.position.x)
        .attr('y', d => d.position.y)
        .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
            .on("end", dragended)
        );

    node.append("rect")
        .attr("width", '150')
        .attr("height", '75')
        // .attr('x', d => d.position.x)
        // .attr('y', d => d.position.y)
        .style("fill", 'silver');


    node.append("title")
        .text( (d) => d.name);

    node.append("text")
        .attr("dy", 15)
        .attr('font-size',15)
        .text( (d) => d.name+":"+d.label);

    simulation
        .nodes(nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(connections);

}

function ticked() {

    link
        .attr("x1", function (d) {return d.source.x + 50 ;})
        .attr("y1", function (d) {return d.source.y +50 ;})
        .attr("x2", function (d) {return d.target.x ;})
        .attr("y2", function (d) {return d.target.y +35 ;});


    node
        .attr("transform", function (d) {return "translate(" + d.x + ", " + d.y + ")";});

    edgepaths.attr('d', function (d) {
        return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
    });

    edgelabels.attr('transform', function (d) {
        if (d.target.x < d.source.x) {
            let bbox = this.getBBox();

            x = bbox.x + bbox.width / 2;
            y = bbox.y + bbox.height / 2;
            return 'rotate(180 ' + x + ' ' + y + ')';
        }
        else {
            return 'rotate(0)';
        }
    });
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x;
    d.fy = d.y;


}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

   function dragended(d) {
       if (!d3.event.active) simulation.alphaTarget(0);
       d.fx = null;
       d.fy = null;
   }