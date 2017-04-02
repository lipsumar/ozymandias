
# Ozymandias

**Ozymandias** is a nodeJS library to organize tasks among a group of people.

This is the core of the [OPTIMUM PARK™](http://www.optimum-park.com/) artwork.

Out of the box, this allows you to configure terminals, stations, levels and tasks, register subjects (see Terminology) and start a session. Note that this is only the core module, not the full OPTIMUM PARK™ code.

Many events are available to hook into the process, take a look at the example server.

An ideal example configuration is provided, along with a module to simulate the actions of agents and subjects.

## Usage
First clone this repo and `cd` into it.

```bash
$ npm install
$ node example-server.js
```

This should run a session at 10x speed with the example config.


## Terminology

* A **session** is one game, made of multiple levels;
* A **subject** is a person participating to the session (ie. the public);
* An **agent** is a person responsible for a station (ie. the staff);
* A **station** is a place;
* A **terminal** is a computer or tablet the agents use;
* An **assignment** is a task given to a subject;
* A **task** is something to be done by a subject.

A station and terminal are said "free" when no task is being executed on them.

The software is currently limited to 1 terminal for 1 station, although terminals and stations can be configured differently in different levels.

Subjects "log" on terminals when the arrive to a station.

A level is said "over" when the time allowed to that levels is over. It is said "clear" when in addition to being over, all subjects have finished their task.

At some point, Ozymandias will "cancel" tasks because these tasks are no longer eligible (Tasks must never be done twice by the same subject, not enough time left in level, ...).

A **blame** is given to subjects who don't arrive on time (protection against registered subjects who leave).

The **monitor** is the terminal UI.


## Dev notes

* The timer should not use the actual time but produce its own ticks, allowing for pause.
* Strange use of `amdefine` in some modules, probably useless.
* It should be possible for a terminal to move from station to station (not being bound to one station) inside of a level but the code is not complete.
* The ids of subjects start at 12 for mystical reasons that will not be explained.


## License

GNU LGPLv3