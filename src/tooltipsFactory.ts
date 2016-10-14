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

module powerbi.extensibility.visual {
    // powerbi
    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;

    // powerbi.data
    import hasRole = powerbi.data.DataRoleHelper.hasRole;

    // powerbi.visuals
    import valueFormatter = powerbi.visuals.valueFormatter;
    import VisualTooltipDataItem = powerbi.visuals.VisualTooltipDataItem;

    export interface ForceGraphTooltipInputObject {
        [propertyName: string]: any;
    }

    export class ForceGraphTooltipsFactory {
        public static build(
            inputObject: ForceGraphTooltipInputObject,
            dataViewMetadataColumns: DataViewMetadataColumn[]): VisualTooltipDataItem[] {

            var tooltips: VisualTooltipDataItem[] = [];

            if (!inputObject) {
                return tooltips;
            }

            for (var propertyName in inputObject) {
                var column: DataViewMetadataColumn,
                    value: string;

                column = ForceGraphMetadataRoleHelper.getColumnByRoleName(
                    dataViewMetadataColumns,
                    propertyName);

                if (!column || !column.displayName) {
                    continue;
                }

                value = inputObject[propertyName];

                if (!_.isNumber(value)) {
                    value = valueFormatter.format(value, valueFormatter.getFormatStringByColumn(column));
                }

                tooltips.push({
                    displayName: column.displayName,
                    value: value
                });
            }

            return tooltips;
        }
    }

    export class ForceGraphMetadataRoleHelper {
        public static getColumnByRoleName(
            dataViewMetadataColumns: DataViewMetadataColumn[],
            roleName: string): DataViewMetadataColumn {

            if (!_.isEmpty(dataViewMetadataColumns) && roleName) {
                for (var i = 0, length = dataViewMetadataColumns.length; i < length; i++) {
                    var column: DataViewMetadataColumn = dataViewMetadataColumns[i];

                    if (column && hasRole(column, roleName)) {
                        return column;
                    }
                }
            }

            return null;
        }
    }
}
