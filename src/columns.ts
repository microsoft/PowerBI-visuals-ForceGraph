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
    import DataView = powerbi.DataView;
    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;

    export class ForceGraphColumns<T> {
        public static getMetadataColumns(dataView: DataView): ForceGraphColumns<DataViewMetadataColumn> {
            var columns = dataView && dataView.metadata && dataView.metadata.columns;
            return columns && _.mapValues(
                new ForceGraphColumns<DataViewMetadataColumn>(),
                (n, i) => columns.filter(x => x.roles && x.roles[i])[0]);
        }

        public static getTableValues(dataView: DataView): ForceGraphColumns<any[]> {
            var table = dataView && dataView.table;
            var columns = this.getMetadataColumns(dataView);
            return columns && table && <any>_.mapValues(
                columns, (n: DataViewMetadataColumn, i) => n && table.rows.map(row => row[n.index]));
        }

        public static getTableRows(dataView: DataView): ForceGraphColumns<any>[] {
            var table = dataView && dataView.table;
            var columns = this.getMetadataColumns(dataView);
            return columns && table && table.rows.map(row =>
                _.mapValues(columns, (n: DataViewMetadataColumn, i) => n && row[n.index]));
        }

        public Source: T = null;
        public Target: T = null;
        public Weight: T = null;
        public LinkType: T = null;
        public SourceType: T = null;
        public TargetType: T = null;
    }
}
