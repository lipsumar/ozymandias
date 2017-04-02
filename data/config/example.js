var _ = require('underscore');

module.exports = {
	levels: [
		{duration: 60000*5},
		{duration: 60000*15},
		{duration: 60000*15}
	],
	stations: [
		{
			id: 1,
			title: "1",
		},
		{
			id: 2,
			title: "2"
		},
		{
			id: 3,
			title: "3"
		},
		{
			id: 4,
			title: "4",
		},
		{
			id: 5,
			title: "5"
		},
		{
			id: 6,
			title: "6"
		},
		{
			id: 7,
			title: "7"
		}
	],
	terminals: [
		{
			id: 1,
			canExecuteAtStations: [1]
		},
		{
			id: 2,
			canExecuteAtStations: [2]
		},
		{
			id: 3,
			canExecuteAtStations: [3]
		},
		{
			id: 4,
			canExecuteAtStations: [4]
		},
		{
			id: 5,
			canExecuteAtStations: [5]
		},
		{
			id: 6,
			canExecuteAtStations: [6]
		},
		{
			id: 7,
			canExecuteAtStations: [7]
		}
	],
	tasks: [
		// lvl 1
		{
			id: 1,
			title: "Task 1",
			numberOfParticipants: 8,
			canExecuteOnStations: [1],
			priority: 10,
			duration: 60000*3,
			levels:[0]
		},
		{
			id: 2,
			title: "Task 2",
			numberOfParticipants: 8,
			mustBeEven: true,
			canExecuteOnStations: [2],
			priority: 10,
			duration: 60000*4,
			levels:[0]
		},
		{
			id: 3,
			title: "Task 3",
			numberOfParticipants: 8,
			mustBeEven: true,
			canExecuteOnStations: [3],
			priority: 10,
			duration: 60000*5,
			levels:[0]
		},
		{
			id: 4,
			title: "Task 4",
			numberOfParticipants: 7,
			canExecuteOnStations: [6],
			priority: 10,
			duration: 60000*4,
			levels:[0]
		},
		{
			id: 5,
			title: "Task 5",
			numberOfParticipants: 6,
			canExecuteOnStations: [5],
			priority: 10,
			duration: 60000*2,
			levels:[0]
		},
		{
			id: 6,
			title: "Task 6",
			numberOfParticipants: 7,
			canExecuteOnStations: [4],
			priority: 10,
			duration: 60000*6,
			levels:[0]
		},
		{
			id: 7,
			title: "Task 7",
			numberOfParticipants: 6,
			canExecuteOnStations: [7],
			priority: 10,
			duration: 60000*3.5,
			levels:[0]
		},



		/// lvl 2

		{
			id: 8,
			title: "Task 8",
			numberOfParticipants: 4,
			canExecuteOnStations: [1],
			priority: 10,
			duration: 60000*2,
			levels:[1]
		},

		{
			id: 9,
			title: "Task 9",
			numberOfParticipants: 2,
			canExecuteOnStations: [2],
			priority: 10,
			duration: 60000*2,
			levels:[1]
		},
		{
			id: 10,
			title: "Task 10",
			numberOfParticipants: 8,
			canExecuteOnStations: [3],
			priority: 10,
			duration: 60000*2,
			levels:[1]
		},
		{
			id: 11,
			title: "Task 11",
			numberOfParticipants: 4,
			canExecuteOnStations: [6],
			priority: 10,
			duration: 60000*3,
			levels:[1]
		},
		{
			id: 12,
			title: "Task 12",
			numberOfParticipants: 12,
			canExecuteOnStations: [5],
			priority: 10,
			duration: 60000*6,
			levels:[1]
		},

		{
			id: 13,
			title: "Task 13",
			numberOfParticipants: 8,
			canExecuteOnStations: [4],
			priority: 10,
			duration: 60000*6,
			levels:[1]
		},
		{
			id: 14,
			title: "Task 14",
			numberOfParticipants: 12,
			canExecuteOnStations: [7],
			priority: 5,
			duration: 60000*5,
			levels:[1]
		},


		// lvl 3
		{
			id: 15,
			title: "Task 15",
			numberOfParticipants: 8,
			canExecuteOnStations: [1],
			priority: 10,
			duration: 60000*15,
			levels:[2]
		},
		{
			id: 16,
			title: "Task 16",
			numberOfParticipants: 8,
			canExecuteOnStations: [3],
			priority: 10,
			duration: 60000*15,
			levels:[2]
		},
		{
			id: 17,
			title: "Task 17",
			numberOfParticipants: 10,
			canExecuteOnStations: [5],
			priority: 10,
			duration: 60000*15,
			levels:[2]
		},
		{
			id: 18,
			title: "Task 18",
			numberOfParticipants: 10,
			canExecuteOnStations: [4],
			priority: 10,
			duration: 60000*15,
			levels:[2]
		},
		{
			id: 19,
			title: "Task 19",
			numberOfParticipants: 14,
			canExecuteOnStations: [7],
			priority: 10,
			duration: 60000*15,
			levels:[2]
		}
	]
};
