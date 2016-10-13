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
