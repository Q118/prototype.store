'use strict';

const e = React.createElement;

//const {BlobServiceClient, BlobItem } = require('@azure/storage-blob');
class Props { }

class State {
    // a place to store our blob item metadata after we query them from the service
    blobsWeFound = [];
    containerUrl = "";
}

class BlobView extends React.Component {
    /**
     * @param {Props} props - the props passed to the component
     * @param {State} state - the state of the component
     */
    constructor(props, state) {
        super(props, state);
        this.state = { blobsWeFound: [], containerUrl: "" };
    }


    // here's our azure identity config
    async componentDidMount() {
        // const signInOptions = {
        //     // the client id is the application id, from your earlier app registration
        //     clientId: "01dd2ae0-4a39-43a6-b3e4-742d2bd41822",
        //     // this is your tenant id - the id of your azure ad tenant. available from your app registration overview
        //     tenantId: "98a34a88-7940-40e8-af71-913452037f31"
        // }

        const blobStorageClient = new BlobServiceClient(
            // this is the blob endpoint of your storage acccount. Available from the portal 
            // they follow this format: <accountname>.blob.core.windows.net for Azure global
            // the endpoints may be slightly different from national clouds like US Gov or Azure China
            "https://devstoreaccount1.blob.core.windows.net/"
            //,
            //new InteractiveBrowserCredential(signInOptions)
        )

        // this uses our container we created earlier - I named mine "private"
        var containerClient = blobStorageClient.getContainerClient("apirequests");
        var localBlobList = [];
        // now let's query our container for some blobs!
        for await (const blob of containerClient.listBlobsFlat()) {
            // and plunk them in a local array...
            localBlobList.push(blob);
        }
        // ...that we push into our state
        this.setState({ blobsWeFound: localBlobList, containerUrl: containerClient.url });
    }



    render() {
        return (
           `<div>
                <table>
                    <thead>
                        <tr>
                            <th>blob name</th>
                            <th>blob size</th>
                            <th>download url</th>
                        </tr>
                    </thead>
                    <tbody>{
                        this.state.blobsWeFound.map((x, i) => {
                            return <tr key={i}>
                                <td>{x.name}</td>
                                <td>{x.properties.contentLength}</td>
                                <td>
                                    <img src={this.state.containerUrl + x.name} />
                                </td>
                            </tr>
                        })
                    }
                    </tbody>
                </table>
            </div>`
        )
    }
}

console.log("heee")
const domContainer = document.querySelector('#history_container');
const root = ReactDOM.createRoot(domContainer);
root.render(e(BlobView));