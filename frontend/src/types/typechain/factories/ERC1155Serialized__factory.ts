/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  ERC1155Serialized,
  ERC1155SerializedInterface,
} from "../ERC1155Serialized";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint128",
        name: "class",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "serial",
        type: "uint128",
      },
    ],
    name: "SerialMint",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "ids",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "values",
        type: "uint256[]",
      },
    ],
    name: "TransferBatch",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "TransferSingle",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "value",
        type: "string",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "URI",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "accounts",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "ids",
        type: "uint256[]",
      },
    ],
    name: "balanceOfBatch",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "exists",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC1155BatchReceived",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC1155Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "ids",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "amounts",
        type: "uint256[]",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeBatchTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
    ],
    name: "tokenClass",
    outputs: [
      {
        internalType: "uint128",
        name: "",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
    ],
    name: "tokenSerialNumber",
    outputs: [
      {
        internalType: "uint128",
        name: "",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "class_",
        type: "uint128",
      },
    ],
    name: "totalSerialized",
    outputs: [
      {
        internalType: "uint128",
        name: "",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
    ],
    name: "uri",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b506040805160208101909152600081526200002c8162000033565b506200012f565b8051620000489060029060208401906200004c565b5050565b8280546200005a90620000f2565b90600052602060002090601f0160209004810192826200007e5760008555620000c9565b82601f106200009957805160ff1916838001178555620000c9565b82800160010185558215620000c9579182015b82811115620000c9578251825591602001919060010190620000ac565b50620000d7929150620000db565b5090565b5b80821115620000d75760008155600101620000dc565b600181811c908216806200010757607f821691505b602082108114156200012957634e487b7160e01b600052602260045260246000fd5b50919050565b61182a806200013f6000396000f3fe608060405234801561001057600080fd5b50600436106100f45760003560e01c8063a22cb46511610097578063dfe1aab811610066578063dfe1aab81461027c578063e985e9c51461028d578063f23a6e61146102c9578063f242432a146102e8576100f4565b8063a22cb465146101fd578063bc197c8114610210578063bd62062b14610248578063bd85b0391461025c576100f4565b80630e89341c116100d35780630e89341c146101865780632eb2c2d6146101a65780634e1273f4146101bb5780634f558e79146101db576100f4565b8062fdd58e146100f957806301ffc9a71461011f578063099a056214610142575b600080fd5b61010c61010736600461126b565b6102fb565b6040519081526020015b60405180910390f35b61013261012d36600461135f565b610392565b6040519015158152602001610116565b61016e61015036600461139e565b6001600160801b039081166000908152600460205260409020541690565b6040516001600160801b039091168152602001610116565b6101996101943660046113c5565b6103b4565b6040516101169190611546565b6101b96101b4366004611128565b610512565b005b6101ce6101c9366004611294565b6105a9565b6040516101169190611505565b6101326101e93660046113c5565b600090815260036020526040902054151590565b6101b961020b366004611231565b61070b565b61022f61021e366004611128565b63bc197c8160e01b95945050505050565b6040516001600160e01b03199091168152602001610116565b61016e6102563660046113c5565b60801c90565b61010c61026a3660046113c5565b60009081526003602052604090205490565b61016e61028a3660046113c5565b90565b61013261029b3660046110f6565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205460ff1690565b61022f6102d73660046111ce565b63f23a6e6160e01b95945050505050565b6101b96102f63660046111ce565b61071a565b60006001600160a01b03831661036c5760405162461bcd60e51b815260206004820152602b60248201527f455243313135353a2062616c616e636520717565727920666f7220746865207a60448201526a65726f206164647265737360a81b60648201526084015b60405180910390fd5b506000908152602081815260408083206001600160a01b03949094168352929052205490565b600061039d826107a1565b806103ac57506103ac826107f1565b90505b919050565b60606000600560006103c68560801c90565b6001600160801b03166001600160801b0316815260200190815260200160002080546103f190611683565b9050116104545760405162461bcd60e51b815260206004820152602b60248201527f4552433131353553657269616c697a65643a20746f6b656e2055524920646f6560448201526a1cc81b9bdd08195e1a5cdd60aa1b6064820152608401610363565b600560006104628460801c90565b6001600160801b03166001600160801b03168152602001908152602001600020805461048d90611683565b80601f01602080910402602001604051908101604052809291908181526020018280546104b990611683565b80156105065780601f106104db57610100808354040283529160200191610506565b820191906000526020600020905b8154815290600101906020018083116104e957829003601f168201915b50505050509050919050565b6001600160a01b03851633148061052e575061052e853361029b565b6105955760405162461bcd60e51b815260206004820152603260248201527f455243313135353a207472616e736665722063616c6c6572206973206e6f74206044820152711bdddb995c881b9bdc88185c1c1c9bdd995960721b6064820152608401610363565b6105a28585858585610816565b5050505050565b6060815183511461060e5760405162461bcd60e51b815260206004820152602960248201527f455243313135353a206163636f756e747320616e6420696473206c656e677468604482015268040dad2e6dac2e8c6d60bb1b6064820152608401610363565b6000835167ffffffffffffffff81111561063857634e487b7160e01b600052604160045260246000fd5b604051908082528060200260200182016040528015610661578160200160208202803683370190505b50905060005b8451811015610703576106c885828151811061069357634e487b7160e01b600052603260045260246000fd5b60200260200101518583815181106106bb57634e487b7160e01b600052603260045260246000fd5b60200260200101516102fb565b8282815181106106e857634e487b7160e01b600052603260045260246000fd5b60209081029190910101526106fc816116eb565b9050610667565b509392505050565b610716338383610a1d565b5050565b6001600160a01b0385163314806107365750610736853361029b565b6107945760405162461bcd60e51b815260206004820152602960248201527f455243313135353a2063616c6c6572206973206e6f74206f776e6572206e6f7260448201526808185c1c1c9bdd995960ba1b6064820152608401610363565b6105a28585858585610afe565b60006001600160e01b03198216636cdb3d1360e11b14806107d257506001600160e01b031982166303a24d0760e21b145b806103ac57506301ffc9a760e01b6001600160e01b03198316146103ac565b60006001600160e01b03198216630271189760e51b14806103ac57506103ac826107a1565b81518351146108785760405162461bcd60e51b815260206004820152602860248201527f455243313135353a2069647320616e6420616d6f756e7473206c656e677468206044820152670dad2e6dac2e8c6d60c31b6064820152608401610363565b6001600160a01b03841661089e5760405162461bcd60e51b8152600401610363906115a1565b336108ad818787878787610c2a565b60005b84518110156109af5760008582815181106108db57634e487b7160e01b600052603260045260246000fd5b60200260200101519050600085838151811061090757634e487b7160e01b600052603260045260246000fd5b602090810291909101810151600084815280835260408082206001600160a01b038e1683529093529190912054909150818110156109575760405162461bcd60e51b8152600401610363906115e6565b6000838152602081815260408083206001600160a01b038e8116855292528083208585039055908b16825281208054849290610994908490611654565b92505081905550505050806109a8906116eb565b90506108b0565b50846001600160a01b0316866001600160a01b0316826001600160a01b03167f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb87876040516109ff929190611518565b60405180910390a4610a15818787878787610d6e565b505050505050565b816001600160a01b0316836001600160a01b03161415610a915760405162461bcd60e51b815260206004820152602960248201527f455243313135353a2073657474696e6720617070726f76616c20737461747573604482015268103337b91039b2b63360b91b6064820152608401610363565b6001600160a01b03838116600081815260016020908152604080832094871680845294825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b6001600160a01b038416610b245760405162461bcd60e51b8152600401610363906115a1565b33610b43818787610b3488610ed9565b610b3d88610ed9565b87610c2a565b6000848152602081815260408083206001600160a01b038a16845290915290205483811015610b845760405162461bcd60e51b8152600401610363906115e6565b6000858152602081815260408083206001600160a01b038b8116855292528083208785039055908816825281208054869290610bc1908490611654565b909155505060408051868152602081018690526001600160a01b03808916928a821692918616917fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62910160405180910390a4610c21828888888888610f32565b50505050505050565b6001600160a01b038516610ccd5760005b8351811015610ccb57828181518110610c6457634e487b7160e01b600052603260045260246000fd5b602002602001015160036000868481518110610c9057634e487b7160e01b600052603260045260246000fd5b602002602001015181526020019081526020016000206000828254610cb59190611654565b90915550610cc49050816116eb565b9050610c3b565b505b6001600160a01b038416610a155760005b8351811015610c2157828181518110610d0757634e487b7160e01b600052603260045260246000fd5b602002602001015160036000868481518110610d3357634e487b7160e01b600052603260045260246000fd5b602002602001015181526020019081526020016000206000828254610d58919061166c565b90915550610d679050816116eb565b9050610cde565b6001600160a01b0384163b15610a155760405163bc197c8160e01b81526001600160a01b0385169063bc197c8190610db29089908990889088908890600401611462565b602060405180830381600087803b158015610dcc57600080fd5b505af1925050508015610dfc575060408051601f3d908101601f19168201909252610df991810190611382565b60015b610ea957610e08611732565b806308c379a01415610e425750610e1d611749565b80610e285750610e44565b8060405162461bcd60e51b81526004016103639190611546565b505b60405162461bcd60e51b815260206004820152603460248201527f455243313135353a207472616e7366657220746f206e6f6e20455243313135356044820152732932b1b2b4bb32b91034b6b83632b6b2b73a32b960611b6064820152608401610363565b6001600160e01b0319811663bc197c8160e01b14610c215760405162461bcd60e51b815260040161036390611559565b60408051600180825281830190925260609160009190602080830190803683370190505090508281600081518110610f2157634e487b7160e01b600052603260045260246000fd5b602090810291909101015292915050565b6001600160a01b0384163b15610a155760405163f23a6e6160e01b81526001600160a01b0385169063f23a6e6190610f7690899089908890889088906004016114c0565b602060405180830381600087803b158015610f9057600080fd5b505af1925050508015610fc0575060408051601f3d908101601f19168201909252610fbd91810190611382565b60015b610fcc57610e08611732565b6001600160e01b0319811663f23a6e6160e01b14610c215760405162461bcd60e51b815260040161036390611559565b80356001600160a01b03811681146103af57600080fd5b600082601f830112611023578081fd5b8135602061103082611630565b60405161103d82826116be565b8381528281019150858301600585901b8701840188101561105c578586fd5b855b8581101561107a5781358452928401929084019060010161105e565b5090979650505050505050565b600082601f830112611097578081fd5b813567ffffffffffffffff8111156110b1576110b161171c565b6040516110c8601f8301601f1916602001826116be565b8181528460208386010111156110dc578283fd5b816020850160208301379081016020019190915292915050565b60008060408385031215611108578182fd5b61111183610ffc565b915061111f60208401610ffc565b90509250929050565b600080600080600060a0868803121561113f578081fd5b61114886610ffc565b945061115660208701610ffc565b9350604086013567ffffffffffffffff80821115611172578283fd5b61117e89838a01611013565b94506060880135915080821115611193578283fd5b61119f89838a01611013565b935060808801359150808211156111b4578283fd5b506111c188828901611087565b9150509295509295909350565b600080600080600060a086880312156111e5578081fd5b6111ee86610ffc565b94506111fc60208701610ffc565b93506040860135925060608601359150608086013567ffffffffffffffff811115611225578182fd5b6111c188828901611087565b60008060408385031215611243578182fd5b61124c83610ffc565b915060208301358015158114611260578182fd5b809150509250929050565b6000806040838503121561127d578182fd5b61128683610ffc565b946020939093013593505050565b600080604083850312156112a6578182fd5b823567ffffffffffffffff808211156112bd578384fd5b818501915085601f8301126112d0578384fd5b813560206112dd82611630565b6040516112ea82826116be565b8381528281019150858301600585901b870184018b1015611309578889fd5b8896505b848710156113325761131e81610ffc565b83526001969096019591830191830161130d565b5096505086013592505080821115611348578283fd5b5061135585828601611013565b9150509250929050565b600060208284031215611370578081fd5b813561137b816117db565b9392505050565b600060208284031215611393578081fd5b815161137b816117db565b6000602082840312156113af578081fd5b81356001600160801b038116811461137b578182fd5b6000602082840312156113d6578081fd5b5035919050565b6000815180845260208085019450808401835b8381101561140c578151875295820195908201906001016113f0565b509495945050505050565b60008151808452815b8181101561143c57602081850181015186830182015201611420565b8181111561144d5782602083870101525b50601f01601f19169290920160200192915050565b6001600160a01b0386811682528516602082015260a06040820181905260009061148e908301866113dd565b82810360608401526114a081866113dd565b905082810360808401526114b48185611417565b98975050505050505050565b6001600160a01b03868116825285166020820152604081018490526060810183905260a0608082018190526000906114fa90830184611417565b979650505050505050565b60006020825261137b60208301846113dd565b60006040825261152b60408301856113dd565b828103602084015261153d81856113dd565b95945050505050565b60006020825261137b6020830184611417565b60208082526028908201527f455243313135353a204552433131353552656365697665722072656a656374656040820152676420746f6b656e7360c01b606082015260800190565b60208082526025908201527f455243313135353a207472616e7366657220746f20746865207a65726f206164604082015264647265737360d81b606082015260800190565b6020808252602a908201527f455243313135353a20696e73756666696369656e742062616c616e636520666f60408201526939103a3930b739b332b960b11b606082015260800190565b600067ffffffffffffffff82111561164a5761164a61171c565b5060051b60200190565b6000821982111561166757611667611706565b500190565b60008282101561167e5761167e611706565b500390565b600181811c9082168061169757607f821691505b602082108114156116b857634e487b7160e01b600052602260045260246000fd5b50919050565b601f8201601f1916810167ffffffffffffffff811182821017156116e4576116e461171c565b6040525050565b60006000198214156116ff576116ff611706565b5060010190565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b600060033d111561028a57600481823e5160e01c90565b600060443d10156117595761028a565b6040516003193d81016004833e81513d67ffffffffffffffff816024840111818411171561178b57505050505061028a565b82850191508151818111156117a55750505050505061028a565b843d87010160208285010111156117c15750505050505061028a565b6117d0602082860101876116be565b509094505050505090565b6001600160e01b0319811681146117f157600080fd5b5056fea2646970667358221220460623b4bbd982d8051473c5daec3e922b96ad4f91fd34deb4ac2e73c17154f764736f6c63430008030033";

export class ERC1155Serialized__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ERC1155Serialized> {
    return super.deploy(overrides || {}) as Promise<ERC1155Serialized>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): ERC1155Serialized {
    return super.attach(address) as ERC1155Serialized;
  }
  connect(signer: Signer): ERC1155Serialized__factory {
    return super.connect(signer) as ERC1155Serialized__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ERC1155SerializedInterface {
    return new utils.Interface(_abi) as ERC1155SerializedInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ERC1155Serialized {
    return new Contract(address, _abi, signerOrProvider) as ERC1155Serialized;
  }
}
