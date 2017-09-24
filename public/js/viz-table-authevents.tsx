// viz-table-authevents.tsx
/// <reference types="react" />
/// <reference types="react-dom" />
class AuthEventFields extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (<tr>
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
class TableHeader extends React.Component<{ fields: Array<string> }> {
    constructor(props) {
        super(props);
    }
    render() {
        var fs = [];
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
    render() {
        return (<th>{this.props.name}</th>);
    }
}
interface AuthEvent {
    _id: string;
    timestamp: string;
    ip_address: string;
    username: string;
    user_agent: string;
    result: string;
}

class AuthEventRecord extends React.Component<{ ae: AuthEvent }> {
    constructor(props) {
        super(props);
    }
    render() {
        return (<tr>
            <td>{this.props.ae.timestamp}</td>
            <td>{this.props.ae.ip_address}</td>
            <td>{this.props.ae.username}</td>
            <td>{this.props.ae.user_agent}</td>
            <td>{this.props.ae.result}</td>
        </tr>);
    }
}
type AuthEvents = Array<AuthEvent>;

class VizTable extends React.Component<{ rows?: AuthEvents }> {
    render() {
        var rowcomps = [];
        this.props.rows.forEach((r) => {
            rowcomps.push(<AuthEventRecord key={r._id} ae={r} />);
        })
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
var recs = [];
function loadRecords() {
    let api = "/api/1/findRecords";
    var client = new XMLHttpRequest();
    client.onload = function () {
        // in case of network errors this might not give reliable results
        if (200 == this.status) {
            try {
                var json = JSON.parse(this.responseText);
                recs = json;
                recs.sort(cmpTimestamp);

                ReactDOM.render(
                    <VizTable rows={recs} />,
                    document.getElementById('authevents')
                );

            } catch (e) {
                console.log(`error parsing data: ${this.responseText}`);
            }
        }
    }
    client.open("GET", api);
    client.send();
}

// Idealy MongoDB should do this heavy-lifting.
function timestampToNumeric(ts: string) {
    return new Date(ts).getTime();
}
function cmpTimestamp(a: AuthEvent, b: AuthEvent): number {
    return timestampToNumeric(a.timestamp) >= timestampToNumeric(b.timestamp) ? -1 : 1;
}

loadRecords();