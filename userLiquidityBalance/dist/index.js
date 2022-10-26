"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
// import { merkletree } from"merkletreejs"
const graphql_request_1 = require("graphql-request");
const constants_1 = require("./constants");
const { keccak256 } = ethers_1.ethers.utils;
const getJoinPools = async () => {
    let first_id = "0";
    let join = [];
    while (true) {
        const getJoinPoolsQuery = (0, graphql_request_1.gql) `
            {
                joins(
                    first: 1000
                    where: {
                        id_gt: "${first_id}"
                        timestamp_gte: "${constants_1.START_TIME}"
                        timestamp_lte: "${constants_1.END_TIME}"
                    }
                    orderBy: id
                    orderDirection: asc
                ) {
                    id
                    timestamp
                    sender
                    pool {
                        id
                    }
                    liquidity
                }
            }
        `;
        const newJoin = await (0, graphql_request_1.request)(constants_1.GAMUT_SUBGRAPH, getJoinPoolsQuery);
        if (join.length)
            join = join.concat(newJoin.joins);
        else
            join = newJoin.joins;
        if (newJoin.joins.length < 1000)
            break;
        first_id = join[join.length - 1].id;
    }
    return join.sort((a, b) => a.timestamp - b.timestamp);
};
const getExitPools = async () => {
    let first_id = "0";
    let exit = [];
    while (true) {
        const getExitPoolsQuery = (0, graphql_request_1.gql) `
            {
                exits(
                    first: 1000
                    where: {
                        id_gt: "${first_id}"
                        timestamp_gte: "${constants_1.START_TIME}"
                        timestamp_lte: "${constants_1.END_TIME}"
                    }
                    orderBy: id
                    orderDirection: asc
                ) {
                    id
                    timestamp
                    sender
                    pool {
                        id
                    }
                    liquidity
                }
            }
        `;
        const newExit = await (0, graphql_request_1.request)(constants_1.GAMUT_SUBGRAPH, getExitPoolsQuery);
        if (exit.length)
            exit = exit.concat(newExit.exits);
        else
            exit = newExit.exits;
        if (newExit.exits.length < 1000)
            break;
        first_id = exit[exit.length - 1].id;
    }
    exit = exit.map(each => {
        each.liquidity = each.liquidity * -1;
        return each;
    });
    return exit.sort((a, b) => a.timestamp - b.timestamp);
};
const getPoolDayDatas = async () => {
    let poolDayDatas = [];
    let first_time = constants_1.START_TIME > 0 ? constants_1.START_TIME - 1 : 0;
    while (true) {
        const getPoolDayDatasQuery = (0, graphql_request_1.gql) `
            {
                poolDayDatas (
                    first: 1000
                    where: {
                        date_gt: "${first_time}"
                        date_lte: "${constants_1.END_TIME}"
                    }
                    orderBy: date
                    orderDirection: asc
                ) {
                    id
                    date
                    liquidity
                    liquidityUSD
                }
            }
        `;
        const newPoolDayDatas = await (0, graphql_request_1.request)(constants_1.GAMUT_SUBGRAPH, getPoolDayDatasQuery);
        if (poolDayDatas.length)
            poolDayDatas = poolDayDatas.concat(newPoolDayDatas.poolDayDatas);
        else
            poolDayDatas = newPoolDayDatas.poolDayDatas;
        if (newPoolDayDatas.poolDayDatas.length < 1000)
            break;
        first_time = poolDayDatas[poolDayDatas.length - 1].date;
    }
    return poolDayDatas;
};
getJoinPools().then(console.log);
getExitPools().then(console.log);
getPoolDayDatas().then(console.log);
//# sourceMappingURL=index.js.map