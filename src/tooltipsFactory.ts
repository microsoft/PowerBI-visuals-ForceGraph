/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

import powerbi from "powerbi-visuals-api";

import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

import { dataRoleHelper as DataRoleHelperModule } from "powerbi-visuals-utils-dataviewutils";
import hasRole = DataRoleHelperModule.DataRoleHelper.hasRole;

import { valueFormatter as vf } from "powerbi-visuals-utils-formattingutils";
import valueFormatter = vf.valueFormatter;

export interface ForceGraphTooltipInputObject {
    [propertyName: string]: any;
}

export class ForceGraphTooltipsFactory {
    public static build(
        inputObject: ForceGraphTooltipInputObject,
        dataViewMetadataColumns: DataViewMetadataColumn[]): VisualTooltipDataItem[] {

        const tooltips: VisualTooltipDataItem[] = [];

        if (!inputObject) {
            return tooltips;
        }

        for (const propertyName in inputObject) {
            const column: DataViewMetadataColumn = ForceGraphMetadataRoleHelper.getColumnByRoleName(
                dataViewMetadataColumns,
                propertyName);

            if (!column || !column.displayName) {
                continue;
            }

            let value: string = inputObject[propertyName];
            if (!(typeof value === "number")) {
                value = valueFormatter.format(value, valueFormatter.getFormatStringByColumn(column));
            }

            tooltips.push({
                displayName: column.displayName,
                value: `${value}`
            });
        }

        return tooltips;
    }
}

export class ForceGraphMetadataRoleHelper {
    public static getColumnByRoleName(
        dataViewMetadataColumns: DataViewMetadataColumn[],
        roleName: string): DataViewMetadataColumn {

        if (dataViewMetadataColumns && dataViewMetadataColumns.length && roleName) {
            for (const metadataColumn of dataViewMetadataColumns) {
                if (metadataColumn && hasRole(metadataColumn, roleName)) {
                    return metadataColumn;
                }
            }
        }

        return null;
    }
}