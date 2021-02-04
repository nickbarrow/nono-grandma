import React, { Component } from "react";

import { pxl8, groupHits, arrayColumn, arraysEqual } from "../utils/utils";

export default class Pixelator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      boardHTML: null,
      board: null,
      primary: null,
      secondary: null,
      solution: false,
      verticalHints: null,
      horizontalHints: null,
      crossMode: false,
      lastClicked: null,
    };
  }

  // Get a pixel array from img, get hints.
  nonogramate = async (src, size) => {
    var pxl8d = await pxl8(src, size, this.cellOver);

    this.setState({
      boardHTML: pxl8d.boardHTML,
      solution: pxl8d.solution,
      board: [...Array(size)].map((e) => Array(size).fill(0))
    });

    var verticalHints = [],
      horizontalHints = [];
    for (let i = 0; i < size; i++) {
      verticalHints.push(groupHits(pxl8d.solution[i]));
      horizontalHints.push(groupHits(arrayColumn(pxl8d.solution, i)));
    }
    this.setState({ verticalHints, horizontalHints });
  };

  // I feel like this is stinky but I dont care
  //                      vvvvvvvvv
  async componentDidMount(size = 10) {
    this.nonogramate(this.props.src, size);
  }

  // To implement undo function, you could keep a store of the last
  // few board states and revert and pop() on undo().
  cellOver = (e, color) => {
    // Save time if requirement not met.
    // You gonna have to add touch controls at some point dawg
    // Set last clicked element for drags...?
    if (!(e.buttons === 1 && (e.type === "mousedown" || e.type === "mouseover"))) return;

    var cell = e.target,
      cellClasses = cell.classList,
      x = parseInt(e.target.getAttribute("x"), 10),
      y = parseInt(e.target.getAttribute("y"), 10),
      currentBoard = this.state.board;

    if ((e.type === "mouseover" && this.state.crossMode)
        && (cellClasses.contains('filled')
            || cellClasses.contains('crossed'))) return
        

    if (cellClasses.contains("filled") || cellClasses.contains("crossed")) {
      cell.classList.remove("filled");
      cell.classList.remove("crossed");
      currentBoard[y][x] = 0;
    } else {
      if (this.state.crossMode) {
        cellClasses.add("crossed");
      } else {
        cellClasses.add("filled");
        currentBoard[y][x] = 1;
      }
    }

    // if (e.target.getAttribute('v') === '1') console.log('🎯')

    this.setState({ board: currentBoard });
    if (this.state.board.toString() === this.state.solution.toString())
      console.log(true)
  };

  render() {
    return (
      <>
        <div className="nono">
          <ul className="hints horizontal">
            {this.state.horizontalHints?.map((colHints, colIdx) => {
              let groups = [];
              colHints.forEach((hintGroup, hintIdx) => {
                groups.push(<p key={`hg${colIdx}-${hintIdx}`}>{hintGroup}</p>);
              });
              return (
                <li
                  key={`hh-${colIdx}`}
                  className={`${
                    arraysEqual(
                      arrayColumn(this.state.board, colIdx),
                      arrayColumn(this.state.solution, colIdx)
                    )
                      ? "solved"
                      : ""
                  }`}
                >
                  {groups}
                </li>
              );
            })}
          </ul>

          <div className="horizontal-container">
            <ul className="hints vertical">
              {this.state.verticalHints?.map((rowHints, rowIdx) => {
                let groups = [];
                rowHints.forEach((hintGroup, hintIdx) => {
                  groups.push(
                    <p key={`vg${rowIdx}-${hintIdx}`}>{hintGroup}</p>
                  );
                });
                return (
                  <li
                    key={`vh-${rowIdx}`}
                    className={`${
                      arraysEqual(
                        this.state.board[rowIdx],
                        this.state.solution[rowIdx]
                      )
                        ? "solved"
                        : ""
                    }`}
                  >
                    {groups}
                  </li>
                );
              })}
            </ul>

            {/* Once the board has been created it will no longer be null */}
            <div className="playable-board">{this.state.boardHTML}</div>
          </div>
        </div>

        {this.state.board?.toString() === this.state.solution?.toString() && (
          <code>winner is you!</code>
        )}

        <input
          type="checkbox"
          className="cross-toggle"
          onClick={(e) => {
            this.setState({ crossMode: e.target.checked });
          }}
        />
      </>
    );
  }
}
