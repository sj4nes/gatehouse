// viz-table-authevents.tsx
/// <reference types="react" />
/// <reference types="react-dom" />

ReactDOM.render(
    <table className="mui-table">
        <thead>
            <tr>
                <th>Timestamp</th>
                <th>IP</th>
                <th>Username</th>
                <th>User Agent</th>
                <th>Result</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Test</td>
            </tr>
        </tbody>
    </table>,
    document.getElementById('authevents')
);