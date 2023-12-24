/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { DefaultNode, Graph } from '@visx/network';

let rawData = `"近く,コンビニ"
"近く,コンビニ"
"附近"
"近く,コンビニ"
"チェック,イン,前,後,荷物,預かり,チェックイン"
"コイン,ロッカー,大きさ"
"中学生,大人,料金,大人料金"
"チェック,イン,前,後,荷物,預かり,チェックイン"
"駐車場"
"チェック,イン,前,後,荷物,預かり,チェックイン"
"朝食,代金,朝食代金"
"チェック,イン,前,後,荷物,預かり,チェックイン"
"チェック,イン,前,後,荷物,預かり,チェックイン"
"usj,バス"`;

// Split the string into an array of lines
let lines = rawData.split('\n');

// Map each line to an array of words, splitting by commas
let dataArray = lines.map(line => line.replace(/"/g, '').split(','));


let allWords = dataArray.flat();

// Create an object to store the counts
let wordCounts = {};

// Iterate over the words and count them
allWords.forEach(word => {
  wordCounts[word] = (wordCounts[word] || 0) + 1;
});

// Convert object into array of [word, count] pairs
let wordCountPairs = Object.entries(wordCounts);

// Sort the array based on frequency (count)
wordCountPairs.sort((a, b) => b[1] - a[1]);


let count = 20;
// Slice the first 30 elements
let top30Words = wordCountPairs.slice(0, count > wordCountPairs.length? wordCountPairs.length: count);
count = top30Words.length;
console.log(top30Words);

// caculate co occurrence matrix

let corr_matrix = new Array(count);
for(let i=0; i<count; i++) {
    corr_matrix[i] = new Array(count);
    for(let j=0; j<count; j++) {
        corr_matrix[i][j] = 0.0;
    }
}

const count_intersection = (wordA, wordB) => {
    let count = 0;
    for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i].includes(wordA) && dataArray[i].includes(wordB)) {
            count = count + 1;
        }
    }
    return count;
}

for(let i=0; i<count; i++) {
    
    for(let j=0; j<count; j++) {
        let count_inter = count_intersection(top30Words[i][0], top30Words[j][0]);
        //console.log("count intersection", count_inter, " ", top30Words)
        corr_matrix[i][j] = count_inter / (top30Words[i][1] + top30Words[j][1] - count_inter);
    }
}

console.log(corr_matrix);

let nodes_raw = []

for (let i = 0; i < count; i++) {
    nodes_raw.push({id: i.toString(), label: top30Words[i][0], size: top30Words[i][1] * 0.1 > 2 ? top30Words[i][1] * 0.1 : 2})
}

console.log(nodes_raw)


// let edges = [];
// for(let i=0; i<count; i++) {
//   for(let j=0; j<i; j++) {
//     if(corr_matrix[i][j] > 0.01) {
//       edges.push({
//         source: nodes[i],
//         target: nodes[j]
//       })
//     }
//   }
// }

// const nodes = [
//   { x: 10, y: 20 },
//   { x: 200, y: 250 },
//   { x: 300, y: 40, color: '#26deb0' },
// ];

// const links = [
//   { source: nodes[0], target: nodes[1] },
//   { source: nodes[1], target: nodes[2] },
//   { source: nodes[2], target: nodes[0] },
// ];

// const graph = {
//   nodes,
//   links,
// };

export const background = '#FFFFFF';

const caculate_force = (index, pos_now, corr_matrix, threshold, l, c_rep, c_spring) => {
  let F = [0.0, 0.0];
  for (let i = 0; i < corr_matrix.length; i++) {
    if (i !== index) {
      if (corr_matrix[i][index] > threshold) {
        let scale = c_spring * Math.log(distance(pos_now[i], pos_now[index]) / l);
        let vector_minus = vector_add(pos_now[i], vector_scale(pos_now[index], -1))
        F = vector_add(F, vector_scale(vector_minus, scale));
        
        //console.log("spring force for node ", index, " is ", vector_scale(vector_minus, scale))
      } else {
        let scale = c_rep / Math.pow(distance(pos_now[i], pos_now[index]), 2);
        let vector_minus = vector_add(pos_now[index], vector_scale(pos_now[i], -1));
        F = vector_add(F, vector_scale(vector_minus, scale));
        //console.log("repel force for node ", index, " is ", vector_scale(vector_minus, scale))
      }
    }
  }
  //console.log("final force is", F);
  return F;
}

const caculate_force2 = (index, pos_now, corr_matrix, threshold, l) => {
  let F = [0.0, 0.0];
  for (let i = 0; i < corr_matrix.length; i++) {
    if (i !== index) {
      if (corr_matrix[i][index] > threshold) {
        let scale = Math.pow(distance(pos_now[i], pos_now[index]), 2) / l;
        let vector_minus = vector_add(pos_now[i], vector_scale(pos_now[index], -1))
        F = vector_add(F, vector_scale(vector_minus, scale));
        
        //console.log("spring force for node ", index, " is ", vector_scale(vector_minus, scale))
      } 
      let scale_2 = (l * l) / distance(pos_now[i], pos_now[index]);
      let vector_minus_2 = vector_add(pos_now[index], vector_scale(pos_now[i], -1));
      F = vector_add(F, vector_scale(vector_minus_2, scale_2));
      //console.log("repel force for node ", index, " is ", vector_scale(vector_minus, scale))
    }
  }

  console.log("final force is", F);
  return F;
}

const WIDTH = 1000;
const HEIGHT = 1000;
const threshold = 0.01

const vector_add = (posA, posB) => {
  return [posA[0] + posB[0], posA[1] + posB[1]];
}

const vector_scale = (pos, scale) => {
  return [pos[0] * scale, pos[1] * scale];
}

const distance = (posA, posB) => {
  return Math.pow(Math.pow(posA[0] - posB[0], 2) + Math.pow(posA[1] - posB[1], 2), 0.5);
}

let pos = nodes_raw.map(element => {
  return [ 500 + (Math.random() - 0.5) * 400, 500 + (Math.random() - 0.5) * 400];
})

console.log("init pos is", pos);
//let interations = 600;
let interations = 1300;
let delta = 0.006;
for (let inter = 0; inter < interations; inter++) {
  for (let node_index = 0; node_index < pos.length; node_index++) {
    let tmp = vector_add(pos[node_index], vector_scale(caculate_force(node_index, pos, corr_matrix, threshold, 100, 700, 0.3), delta));
    //console.log("the Force is ", tmp)
    //let tmp = vector_add(pos[node_index], vector_scale(caculate_force2(node_index, pos, corr_matrix, 0.01, 180), delta));
    if (tmp[0] > WIDTH - 200) {
      tmp[0] = WIDTH - 200;
    }
    if (tmp[0] < 200) {
      tmp[0] = 200;
    }
    if (tmp[1] > HEIGHT - 200) {
      tmp[1] = HEIGHT - 200;
    }
    if (tmp[1] < 200) {
      tmp[1] = 200;
    }
    pos[node_index] = tmp;
  }
}

console.log("final pos is", pos)
// const nodes = pos.map(({index, element}) => {
//   return {
//     x: element[0],
//     y: element[1],
//     text: nodes_raw[index]['label']
//   }
// })

let color = [
  "#D3EEFF",
  "#FFDCE5",
  "#CFF2D7",
  "#FFF0BB",
  "#FFE6D6",
  "#E7E4FF",
  "#B5F0FD",
  "#3D3F45"
]

let visited = Array(pos.length).fill(0);
let connect_regions = Array(pos.length).fill(null);

const dfs = (corr_matrix, i, threshold, cnt) => {
  visited[i] = 1;
  for (let j = 0; j < corr_matrix.length; j++) {
    if (corr_matrix[i][j] > threshold && visited[j] == 0) {
      dfs(corr_matrix, j, threshold, cnt);
    }
  }
  connect_regions[i] = cnt;
}

let cnt = 0;
for (let i = 0; i < pos.length; i++) {
  if (visited[i] == 0) {
    dfs(corr_matrix, i, threshold, cnt);
    cnt++;
  }
}

console.log("Connected regions:", connect_regions);


console.log("connect regions is", connect_regions);

let nodes = [];

for (let i = 0; i < pos.length; i++) {
  nodes.push({
    x: pos[i][0],
    y: pos[i][1],
    text: nodes_raw[i].label,
    color: color[connect_regions[i] % color.length],
    index: i
  });
}

console.log("nodes is", nodes)


const links = [
  // { source: nodes[0], target: nodes[1] },
  // { source: nodes[1], target: nodes[2] },
  // { source: nodes[2], target: nodes[0] },
];

for (let i = 0; i < corr_matrix.length; i++) {
  for (let j = 0; j < i; j++) {
    if (corr_matrix[i][j] > threshold) {
      links.push({
        source: nodes[i],
        target: nodes[j],
        bold: corr_matrix[i][j] * 5 > 1 ? corr_matrix[i][j] * 5 : 1
      })
    }
  }
}

const graph = {
  nodes,
  links,
};

const calculateSize = (index, top30Words) => {
  return Math.log((top30Words[index][1] + 1) * (top30Words[index][1] + 1)) * 2 > 20 ? 20 : Math.log((top30Words[index][1] + 1) * (top30Words[index][1] + 1)) * 2
}

export const Example = ({ width, height }) =>  {

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <rect width={width} height={height} rx={14} fill={background} />
      <Graph
        graph={graph}
        top={20}
        left={100}
        nodeComponent={({ node: { color, text, index } }) =>
          <><DefaultNode r={calculateSize(index, top30Words)} fill={color} ></DefaultNode><text fontSize={8} x="-5" y="4">{text}</text></>
        }
        linkComponent={({ link: { source, target, dashed, bold } }) => (
          <line
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            strokeWidth={bold}
            stroke="#999"
            strokeOpacity={0.6}
            strokeDasharray={dashed ? '8,4' : undefined}
          />
        )}
      />
    </svg>
  );
}