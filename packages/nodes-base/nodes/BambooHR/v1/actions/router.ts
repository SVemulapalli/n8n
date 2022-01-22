import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	INodeExecutionData,
} from 'n8n-workflow';

import * as employee from './employee';
import * as employeeDocument from './employeeDocument';
import * as file from './file';
import * as companyReport from './companyReport';

import { BambooHR } from './Interfaces';

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const items = this.getInputData();
	const operationResult: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		const resource = this.getNodeParameter<BambooHR>('resource', i);
		const operation = this.getNodeParameter('operation', i);

		const bamboohr = {
			resource,
			operation,
		} as BambooHR;

		if (bamboohr.operation === 'delete') {
			//@ts-ignore
			bamboohr.operation = 'del';
		}

		try {
			if (bamboohr.resource === 'employee') {
				operationResult.push(...await employee[bamboohr.operation].execute.call(this, i));
			} else if (bamboohr.resource === 'employeeDocument') {
				//@ts-ignore
				operationResult.push(...await employeeDocument[bamboohr.operation].execute.call(this, i));
			} else if (bamboohr.resource === 'file') {
				//@ts-ignore
				operationResult.push(...await file[bamboohr.operation].execute.call(this, i));
			} else if (bamboohr.resource === 'companyReport') {
				//@ts-ignore
				operationResult.push(...await companyReport[bamboohr.operation].execute.call(this, i));
			}
		} catch (err) {
			if (this.continueOnFail()) {
				operationResult.push({ json: this.getInputData(i)[0].json, error: err });
			} else {
				throw err;
			}
		}
	}

	return operationResult;
}