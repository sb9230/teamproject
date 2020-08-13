const address = "0x49eD0e859E7E1A32076cF202103139F31b353a54";

const abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "checker",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "car_id",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "check_res",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "check_etc",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "check_time",
        type: "uint64",
      },
    ],
    name: "AddCheck",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_car_id",
        type: "string",
      },
      {
        internalType: "string",
        name: "_check_res",
        type: "string",
      },
      {
        internalType: "string",
        name: "_check_etc",
        type: "string",
      },
      {
        internalType: "uint64",
        name: "_check_time",
        type: "uint64",
      },
    ],
    name: "AddCheckList",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_index",
        type: "uint256",
      },
    ],
    name: "GetCheck",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "TotalCount",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "checks",
    outputs: [
      {
        internalType: "address",
        name: "checker",
        type: "address",
      },
      {
        internalType: "string",
        name: "car_id",
        type: "string",
      },
      {
        internalType: "string",
        name: "check_res",
        type: "string",
      },
      {
        internalType: "string",
        name: "check_etc",
        type: "string",
      },
      {
        internalType: "uint64",
        name: "check_time",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
module.exports = { address, abi };
