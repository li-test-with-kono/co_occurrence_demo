
import React from 'react';
import { GraphCanvas } from 'reagraph';

let rawData = `"近く,コンビニ"
"近く,コンビニ"
"附近"
"近く,コンビニ"
"チェック,イン,前,後,荷物,預かり,チェックイン"
"コイン,ロッカー,大きさ"
"コイン,ロッカー,大きさ"
"駐車場"
"駐車場"
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


let count = 30;
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
    
    for(let j=0; j<i; j++) {
        let count_inter = count_intersection(top30Words[i][0], top30Words[j][0]);
        //console.log("count intersection", count_inter, " ", top30Words)
        corr_matrix[i][j] = count_inter / (top30Words[i][1] + top30Words[j][1] - count_inter);
    }
}

console.log(corr_matrix);

let nodes = []

for (let i = 0; i < count; i++) {
    nodes.push({id: i.toString(), label: top30Words[i][0], size: top30Words[i][1] * 0.1 > 2 ? top30Words[i][1] * 0.1 : 2})
}

//console.log(nodes)

let edges = [];
for(let i=0; i<count; i++) {
  for(let j=0; j<i; j++) {
    if(corr_matrix[i][j] > 0.01) {
      edges.push({
        source: i.toString(),
        target: j.toString(),
        id: i.toString() + '-' + j.toString(),
        label: i.toString() + '-' + j.toString(),
        size: Math.log(corr_matrix[i][j] * 5 + 1) + 1
      })
    }
  }
}

//console.log(edges)

export const MyDiagram = () => (
  <GraphCanvas labelFontUrl="https://ey2pz3.csb.app/NotoSansSC-Regular.ttf"
    nodes={nodes}
    edges={edges}
  />
);