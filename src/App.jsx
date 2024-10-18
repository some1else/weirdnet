import React, { PureComponent } from "react"
import Color from "color"
import { ForceGraph, ForceGraphNode, ForceGraphLink } from "react-vis-force"

// import { primes } from "./util"

import seedData from "./seedData.json"

import { grow, resetIds } from "./Graph"

import "./App.css"

import { decodeWords } from "./wordnet"

let WEIRD_WORDS

const excluded = ["gps", "irs"]

const VERTEX_COUNT = 342

const STAGES = [
  {
    stage: 0,
    verticeCount: 86,
    animateDelayMs: 20,
    delay: 10000,
  },
  {
    stage: 1,
    verticeCount: 114,
    animateDelayMs: 50,
    delay: 12000,
  },
  {
    stage: 2,
    verticeCount: 171,
    animateDelayMs: 40,
    delay: 28000,
  },
  {
    stage: 3,
    verticeCount: 228,
    animateDelayMs: 30,
    delay: 38000,
  },
  {
    stage: 4,
    verticeCount: 342,
    animateDelayMs: 20,
    delay: 56000,
  },
  // {
  //   stage: 5,
  //   verticeCount: 512,
  //   animateDelayMs: 0,
  //   delay: 64000,
  // },
]

function hexColorFor(id) {
  const color = Color(`hsl(${id % 360}, 100%, 50%)`)
  return color.hex()
}

let wordmap = new Map()
let mapped = []

function getWord(id) {
  let word = wordmap.get(id)
  if (!word) {
    word = WEIRD_WORDS[Math.floor(Math.random() * WEIRD_WORDS.length)]
    let retries = 0
    while ((mapped.includes(word) || excluded.includes(word)) && retries < 3) {
      word = WEIRD_WORDS[Math.floor(Math.random() * WEIRD_WORDS.length)]
      retries++
    }
    word = word.replace(/_/g, " ")
    mapped.push(word)
    word = word.substr(0, 1).toUpperCase() + word.substr(1, word.length)
    wordmap.set(id, word)
  }

  return word
}

function getSeedData() {
  return JSON.parse(JSON.stringify(seedData))
}

class App extends PureComponent {
  state = {
    ...getSeedData(),
    stage: 0,
    totalStages: 0,
    showLabel: false,
  }

  animateGraph = () => {
    const { edges, vertices } = this.state

    if (vertices.length >= STAGES[this.state.stage].verticeCount) {
      clearInterval(this.animateInterval)

      const nextStage =
        this.state.stage + 1 === STAGES.length ? 0 : this.state.stage + 1

      setTimeout(() => {
        if (nextStage === 0) {
          wordmap = new Map()
          mapped = []
          resetIds()

          this.setState({
            ...getSeedData(),
            stage: nextStage,
            showLabel: false,
          })
        } else {
          this.setState({
            ...this.state,
            stage: nextStage,
            showLabel: false,
          })
        }

        this.animateInterval = setInterval(
          this.animateGraph,
          STAGES[this.state.stage].animateDelayMs
        )
      }, STAGES[this.state.stage].delay)

      this.setState({
        ...this.state,
        showLabel: true,
        totalStages: this.state.totalStages + 1,
      })

      return
    }

    let { graph } = grow({ edges, vertices }, { test: true })

    this.setState({
      ...this.state,
      edges: graph.edges,
      vertices: graph.vertices,
    })
  }

  componentDidMount() {
    decodeWords().then(newWords => {
      WEIRD_WORDS = newWords

      this.animateInterval = setInterval(
        this.animateGraph,
        STAGES[0].animateDelayMs
      )
    })
  }

  render() {
    const { vertices, edges } = this.state

    return (
      <div className="App">
        <div className="description">
          {this.state.totalStages < 5 && (
            <div>
              Shuffled concentric mind-map on a hexagonal lattice
              <br />
            </div>
          )}
          {this.state.totalStages < 3 && (
            <div>
              =======================================
              <br />
            </div>
          )}
          {this.state.vertices.length} WordNet concepts,{" "}
          {this.state.edges.length} associations
          {this.state.totalStages < 3 && (
            <div>
              <br />
              - It costs two vertices to add a new node.
              <br />- New nodes are added on the perimeter.
            </div>
          )}
        </div>

        {this.state.totalStages === 0 && (
          <h1 className="loading-text">
            Building WeirdNet
            {/* <br />
            {vertices.length} concepts, {edges.length} edges */}
            <br />
            {Math.ceil((vertices.length / VERTEX_COUNT) * 100)}% complete
          </h1>
        )}

        {this.state.totalStages > 0 && (
          <ForceGraph
            labelAttr="label"
            className={`stage-${this.state.stage} showLabel-${this.state.showLabel}`}
            simulationOptions={{
              animate: true,
              // alphaDecay: 0.0001,
              alphaDecay: 0.0000001,
              velocityDecay: 0.375,
              strength: {
                charge: (1 / this.state.vertices.length) * -48000,
              },
              width: window.innerWidth,
              height: window.innerHeight,
            }}
          >
            {vertices.map(({ id }) => (
              <ForceGraphNode
                node={{
                  id,
                  label: `${id}. ${getWord(id)}`,
                }}
                // fill={primes.indexOf(id) === -1 ? "lightgray" : "cyan"}
                fill={hexColorFor(id)}
                key={`vertex-${id}`}
                showLabel={this.state.showLabel}
                r={this.state.showLabel ? 3.75 : 3.75}
                // cx={Math.random() * window.innerWidth}
                // cy={Math.random() * window.innerHeight}
              />
            ))}

            {edges.map(({ source, target }) => (
              <ForceGraphLink
                link={{ source, target }}
                key={`edge-${source}-${target}`}
              />
            ))}
          </ForceGraph>
        )}
      </div>
    )
  }
}

export default App
