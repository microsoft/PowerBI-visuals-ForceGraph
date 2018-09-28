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

import DataView = powerbi.DataView;

import { getRandomNumbers, testDataViewBuilder } from "powerbi-visuals-utils-testutils";
import TestDataViewBuilder = testDataViewBuilder.TestDataViewBuilder;

import { valueType as valueTypeModule } from "powerbi-visuals-utils-typeutils";
import ValueType = valueTypeModule.ValueType;

export class VisualData extends TestDataViewBuilder {
    public static ColumnSource: string = "Source";
    public static ColumnTarget: string = "Target";
    public static ColumnLinkType: string = "LinkType";
    public static ColumnWeight: string = "Weight";
    public static ColumnSourceType: string = "SourceType";
    public static ColumnTargetType: string = "TargetType";

    public valuesSourceTarget: string[][] = [
        ["William", "Brazil"],
        ["Olivia", "USA"],
        ["Daniel", "Portugal"],
        ["Lucas", "Canada"],
        ["Henry", "USA"],
        ["Aiden", "Brazil"],
        ["Daniel", "Portugal"],
        ["Harper", "USA"],
        ["Logan", "Brazil"],
        ["Ella", "Canada"],
        ["USA", "USA"]
    ];

    public valuesWeight: number[] = getRandomNumbers(this.valuesSourceTarget.length, 10, 100);

    public getDataView(columnNames?: string[]): DataView {
        columnNames = columnNames || [
            VisualData.ColumnSource,
            VisualData.ColumnTarget,
            VisualData.ColumnWeight
        ];

        return this.createCategoricalDataViewBuilder([
            {
                source: {
                    displayName: VisualData.ColumnSource,
                    roles: { Source: true },
                    type: ValueType.fromDescriptor({ text: true })
                },
                values: this.valuesSourceTarget.map(x => x[0])
            },
            {
                source: {
                    displayName: VisualData.ColumnTarget,
                    roles: { Target: true },
                    type: ValueType.fromDescriptor({ text: true }),
                },
                values: this.valuesSourceTarget.map(x => x[1])
            },
            {
                source: {
                    displayName: VisualData.ColumnLinkType,
                    roles: { LinkType: true },
                    type: ValueType.fromDescriptor({ text: true }),
                },
                values: []
            },
            {
                source: {
                    displayName: VisualData.ColumnSourceType,
                    roles: { SourceType: true },
                    type: ValueType.fromDescriptor({ text: true }),
                },
                values: []
            },
            {
                source: {
                    displayName: VisualData.ColumnTargetType,
                    roles: { TargetType: true },
                    type: ValueType.fromDescriptor({ text: true }),
                },
                values: []
            }
        ], [
                {
                    source: {
                        displayName: VisualData.ColumnWeight,
                        roles: { Weight: true },
                        isMeasure: true,
                        type: ValueType.fromDescriptor({ numeric: true }),
                    },
                    values: this.valuesWeight
                }
            ], columnNames
        ).build();
    }
}
