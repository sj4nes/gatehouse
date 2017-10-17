// viz-table-authevents.tsx
/// <reference types="react" />
/// <reference types="react-dom" />
class AuthEventFields extends React.Component {
    constructor(props) {
        super(props);
    }
    public render() {
        return (<tr>
            <th>ID</th>
            <th>Timestamp</th>
            <th>IP Address</th>
            <th>Username</th>
            <th>User Agent</th>
            <th>Result</th>
        </tr>);
        /*
         let fnames: Array<string> = "Timestamp,IP Address,Username,User Agent,Result".split(',');
         return (<TableHeader fields={fnames} />);
         */
    }
}

class TableHeader extends React.Component<{ fields: string[] }> {
    constructor(props) {
        super(props);
    }
    public render() {
        const fs = [];
        function newField(name: string): TableHeaderField {
            return (new TableHeaderField(name));
        }
        fs.push(this.props.fields.forEach(newField));
        return (<tr>{fs}</tr>);
    }
}

class TableHeaderField extends React.Component<{ name: string }> {
    constructor(props) {
        super(props);
    }
    public render() {
        return (<th>{this.props.name}</th>);
    }
}
interface IAuthEvent {
    _id: string;
    timestamp: string;
    ip_address: string;
    username: string;
    user_agent: string;
    result: string;
}

class AuthEventRecord extends React.Component<{ ae: IAuthEvent }> {
    constructor(props) {
        super(props);
    }
    public render() {
        return (<tr>
            <td>{this.props.ae._id}</td>
            <td>{this.props.ae.timestamp}</td>
            <td>{this.props.ae.ipAddress}</td>
            <td>{this.props.ae.username}</td>
            <td>{this.props.ae.userAgent}</td>
            <td>{this.props.ae.result}</td>
        </tr>);
    }
}
type AuthEvents = IAuthEvent[];

class VizTable extends React.Component<{ rows?: AuthEvents }> {
    public render() {
        const rowcomps = [];
        this.props.rows.forEach((r) => {
            rowcomps.push(<AuthEventRecord key={r._id} ae={r} />);
        });
        return (<table className="mui-table">
            <thead>
                <AuthEventFields />
            </thead>
            <tbody>
                {rowcomps}
            </tbody>
        </table>);
    }
}
let recs = [];
function loadRecords() {
    const api = "/api/1/findRecords";
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        // in case of network errors this might not give reliable results
        if (200 === xhr.status) {
            try {
                const json = JSON.parse(xhr.responseText);
                recs = json;
                recs.sort(cmpTimestamp);

                ReactDOM.render(
                    <VizTable rows={recs} />,
                    document.getElementById("authevents"),
                );

            } catch (e) {
                // tslint:disable-next-line:no-console
                console.log(`error parsing data: ${xhr.responseText}`);
            }
        }
    };
    xhr.open("GET", api, true);
    xhr.send();
}

// Idealy MongoDB should do this heavy-lifting.
function timestampToNumeric(ts: string) {
    return new Date(ts).getTime();
}
function cmpTimestamp(a: IAuthEvent, b: IAuthEvent): number {
    return timestampToNumeric(a.timestamp) >= timestampToNumeric(b.timestamp) ? -1 : 1;
}

loadRecords();
