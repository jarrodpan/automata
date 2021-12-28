import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';



function Tile(props) {
	//console.log(props);
	//let stateClass = props.tileClass(props.tileRow, props.tileCol);
	//console.log(stateClass);
	return <div className={(props.tileClass ? "tile active" : "tile")} style={{ height: props.squares + "px", width: props.squares + "px" }} data-row={props.tileRow} data-col={props.tileColumn} onClick={props.tileFunction}></div>;
}

function Grid(props) {

	let rows = props.rows;
	let cols = props.cols;
	//console.log(rows, cols);

	const grid = [];

	for (let i = 0; i < rows; i++) {

		const row = [];

		for (let j = 0; j < cols; j++) {
			let activeTile = props.tileClass[i][j];
			row.push(<Tile tileRow={i} tileColumn={j} squares={props.squares} key={j} tileFunction={props.tileFunction} tileClass={props.tileClass[i][j]} />);
		}

		grid.push(<div className={'row ' + 'row' + i} key={i} style={{ height: props.squares + "px" }}>{row}</div>);
	}

	return <><div className="grid">{grid}</div></>;
}

function Settings(props) {

	//console.log("settings", props);

	return (
		<>

			<div className="settings">
				<h2>ReactJS Cellular Automata (Conway's Game of Life)</h2>
				<label>
					Tick speed:&nbsp;
					<input type="number" value={props.speed} onChange={props.speedChange} size="3" disabled={props.running} />
					&nbsp;ms
				</label>
				<button onClick={props.startStop}>{(props.running ? "Stop" : "Go")}</button>
				<button onClick={props.step} disabled={props.running}>Step</button>
				<button onClick={props.reset} disabled={(props.running)}>Reset</button>
				<label>Cycles: {props.cycles}</label>
			</div>
		</>
	);
}

export default class Automata extends React.Component {

	changeSpeed(e) {
		//console.log(e);

		this.setState({
			speed: e.target.value
		});
	}

	toggleCell(e) {
		//
		//console.log("Tile clicked", e);
		let pos = e.target.dataset;
		//let tileClass = e.target.className;
		//console.log("tile pos", pos);

		let newAlive = this.state.alive;
		newAlive[pos.row][pos.col] = (newAlive[pos.row][pos.col] + 1) % 2;

		this.setState({
			alive: newAlive
		}, () => {
			//console.log("tile updated", this.state);
		});


	}

	toggleRun(e) {
		e.preventDefault();
		//console.log("fired", this.state.running);
		//console.log("run toggled", this.state);

		let start = !this.state.running;

		let interval = null;


		if (start) {
			//console.log("initial run state", alive);
			interval = setInterval(this.updateGrid, this.state.speed);

			this.setState({
				running: start,
				runInterval: interval
			}, () => {
				//console.log("state updated to run", this.state.alive, this.state);
			});

		} else {
			interval = this.state.runInterval;
			clearInterval(interval);
			this.setState({
				running: start,
				runInterval: null
			}, () => {
				//console.log("state updated to stop run", this.state.alive, this.state);
			});
		}



	}

	updateGrid(e = null) {
		if (e != null) e.preventDefault();
		// automata rules: per https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
		//
		// 1. Any live cell with two or three live neighbours survives.
		// 2. Any dead cell with three live neighbours becomes a live cell.
		// 3. All other live cells die in the next generation. Similarly, all other dead cells stay dead.
		//

		// apply - we'll assume a looping map

		let currentState = this.state.alive;
		let nextState = new Array(currentState.length);

		for (let i = 0; i < nextState.length; i++) {
			nextState[i] = [...currentState[i]];
		}

		let clock = this.state.cycles;

		//console.log("updaing grid", currentState.at(-1).at(-1));

		let rows = currentState.length;
		let cols = currentState[0].length;

		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				// add count of neighbours

				let neighbours = 0;

				for (let x = -1; x < 2; x++) {
					for (let y = -1; y < 2; y++) {
						if (x == 0 & y == 0) continue; // skip cell itself
						neighbours += currentState.at((i + x) % rows).at((j + y) % cols);
					}
				}

				switch (neighbours) {
					case 0:
					case 1:
					case 4:
					case 5:
					case 6:
					case 7:
					case 8:
						nextState[i][j] = 0; // die by under/overpopulation
						break;
					case 2:
						if (currentState[i][j]) nextState[i][j] = 1; // stay alive if alive
						break;
					case 3:
						nextState[i][j] = 1; // live or come alive
						break;
				}

				// console.log("updaing grid (" + i + "," + j + ") n =", neighbours, ":", currentState.at(i).at(j), " to: ", nextState[i][j]);
			}
		}

		clock++;

		this.setState({
			alive: nextState,
			cycles: clock
		}, () => {
			//console.log("tick:", clock, "now:", currentState, "next:", nextState);
		});



	}

	resetGrid(e) {
		e.preventDefault();
		let startingGrid = new Array(this.state.rows);

		for (let i = 0; i < startingGrid.length; i++) {
			startingGrid[i] = new Array(this.state.columns).fill(0);
		}

		this.setState({
			alive: startingGrid,
			running: false,
			cycles: 0
		}, () => {
			//console.log("grid reset")
		});
	}

	/*getSnapshotBeforeUpdate(prevProps, prevState) {
		console.log("before update", prevState);
		return null;
	}*/

	constructor(props) {
		super(props);

		// make blank rows
		let initRows = 16;
		let initCols = 16;
		let startingGrid = new Array(initRows);

		for (let i = 0; i < initRows; i++) {
			startingGrid[i] = new Array(initCols).fill(0);
		}

		// set starting state
		this.state = {
			rows: initRows,
			columns: initCols,
			alive: startingGrid,
			running: false,
			runInterval: null,
			speed: 500,
			cycles: 0,
			squares: 50
		};

		//console.log("starting state", this.state.alive);
		//console.log("running", this.state.running);
		this.toggleCell = this.toggleCell.bind(this);
		this.toggleRun = this.toggleRun.bind(this);
		this.updateGrid = this.updateGrid.bind(this);
		this.resetGrid = this.resetGrid.bind(this);
		this.changeSpeed = this.changeSpeed.bind(this);
	}


	render() {

		//console.log("current render state", this.state);

		return (
			<>
				<Settings
					running={this.state.running}
					startStop={this.toggleRun}
					step={this.updateGrid}
					reset={this.resetGrid}
					speed={this.state.speed}
					speedChange={this.changeSpeed}
					cycles={this.state.cycles}
				/>
				<Grid
					className="grid"
					squares={this.state.squares}
					rows={this.state.rows}
					cols={this.state.columns}
					tileFunction={this.toggleCell}
					tileClass={this.state.alive}
				/>
			</>
		);
	}

}


