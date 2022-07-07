// serverTiming: "totl;dur=8.2517, vald;dur=0.0771, proc;dur=8.1538, xfrm;dur=0.0095ms"
//parse the above string to get the value of totl;dur=

const aderantServerTiming = "totl;dur=8.2517, vald;dur=0.0771, proc;dur=8.1538, xfrm;dur=0.0095ms"

let serverTiming = aderantServerTiming;

let timingArr = serverTiming.split(", ");
serverTiming = timingArr[0].split("=")[1];


console.log(timingArr);
console.log(serverTiming);

let msgObj = {
    "requestId": "f90efe55-8c24-4ac8-911f-a5b124fedf15",
    "step": "result",
    "serverTiming": "6.7874ms",
    "statusCode": 200
}

//this is returns in ../triage/apirequest as a local
const tenantData = {
    PartitionKey: 'sr', RowKey: '',
    Timestamp: new Date("2022-06-29T14:54:25.414Z"),
    displayName: "Shelby's Dev Tenancy",
    azureLocation: 'eastus2',
    deploymentStatus: 'Development',
    apiSecret: 'f432bde6-402e-41de-a4cb-67b722ed16ba92b68684-077e-49d0-8e57-e359c6e6018a',
    dbConnectionString: 'Data source=accsrusdev.database.windows.net;Initial Catalog=accsrusdev;User ID=adminsr;Password=Ot5oYcVgxB7H4SxLFWKE26eJ5kvzfU4U;',
    storageConnectionString: 'DefaultEndpointsProtocol=https;AccountName=accsrusdev;AccountKey=Plumb2Rm3XSJ3aF7sSc8Mm2XiPkZe0ILMIdSAPYhkfqpvGms7SYb/5hLICuewvfWVvjtDkZcWP7MojXpS8TZuA==;',
    settings: '{}',
    tenantId: 'sr'
}



let tenants = {
    settings: {
      'x-powered-by': true,
      etag: 'weak',
      'etag fn': [Function: generateETag],    
      env: 'development',
      'query parser': 'extended',
      'query parser fn': [Function: parseExtendedQueryString],
      'subdomain offset': 2,
      'trust proxy': false,
      'trust proxy fn': [Function: trustNone],    view: [Function: View],
      views: 'C:\\PoC-RulesEngine\\src\\webapp\\views',
      'jsonp callback name': 'callback',      
      'view engine': 'ejs',
      layout: 'layouts/master',
      port: '8000'
    },
    messages: {},
    selectLists: {
      deploymentStatusList: [
        'Demo',
        'Development',
        'Implementation',
        'Production',
        'QA',
        'Retired'
      ],
      azureLocations: [ [Object], [Object], [Object], [Object] ],
      securityRoles: [ [Object], [Object], [Object], [Object] ]
    },
    security: {
      user: User {
        id: '4421d556-69f1-44ee-9932-c6738dc72dcd',
        username: 'shelby.rothman@aderant.com',
        firstname: 'Shelby',
        lastname: 'Rothman',
        password: '20e38597-eb00-4a4e-9b9b-4af8c2259d94',
        enabled: 'true',
        roles: [Array],
        accessRights: [Map],
        hasAccess: [Function: bound hasAccess],
        hasAllAccess: [Function: bound hasAllAccess]
      },
      userAccessRights: Map(8) {
        'login' => 'login',
        'viewFirewallRules' => 'viewFirewallRules',
        'addMyFirewallRule' => 'addMyFirewallRule',
        'deleteMyFirewallRule' => 'deleteMyFirewallRule',
        'viewDbConnectString' => 'viewDbConnectString',
        'viewStorageConnectString' => 'viewStorageConnectString',
        'viewApiKey' => 'viewApiKey',
        'editTenantConfig' => 'editTenantConfig'
      },
      ACCESS_RIGHT_CODES: {
        USER_ADMIN: 'userAdmin',
        LOGIN: 'login',
        ACCESS_TRIAGE_INVOICE: 'accessTriageInvoice',
        ACCESS_CONNECTOR_STATUS: 'accessConnectorStatus',
        VIEW_DB_CONNECT_STRING: 'viewDbConnectString',
        VIEW_STORAGE_CONNECT_STRING: 'viewStorageConnectString',
        VIEW_API_KEY: 'viewApiKey',
        VIEW_FIREWALL_RULES: 'viewFirewallRules',
        DELETE_ANY_FIREWALL_RULE: 'deleteAnyFirewallRule',
        ADD_ANY_FIREWALL_RULE: 'addAnyFirewallRule',
        VIEW_MY_FIREWALL_RULE: 'viewMyFirewallRule',
        ADD_MY_FIREWALL_RULE: 'addMyFirewallRule',
        DELETE_MY_FIREWALL_RULE: 'deleteMyFirewallRule',
        VIEW_EXTRACTOR_STATUS: 'viewExtractorStatus',
        TRANSFORMER_REPROCESS: 'transformerReprocess',
        RELOAD_CONFIG: 'reloadConfig',        
        REFRESH_TENANTS: 'refreshTenants',    
        REFRESH_AD_USERS: 'refreshADUsers',   
        ACTIVE_DIRECTORY_ADMIN: 'activeDirectoryAdmin',
        SELECT_TENANT_FOR_LOGIN: 'selectTenantForLogin',
        AD_USER_ADMIN: 'adUserAdmin',
        EDIT_TENANT_CONFIG: 'editTenantConfig',
        EDIT_MATTER_UPDATE_PROPERTIES: 'editMatterUpdateProperties',
        UPLOAD_CONFIGURATIONS: 'uploadConfigurations',
        EDIT_AUTOMATION_SETTINGS: 'editAutomationSettings',
        EDIT_EXTRACTOR_SCRIPTS: 'editExtractorScripts',
        EDIT_TRANSFORMER_SCRIPTS: 'editTransformerScripts',
        ADMIN_SITE_USERS: 'adminSiteUsers',   
        CONTROL_EXTRACTOR: 'controlExtractor' 
      },
      hasRight: [Function: bound has],        
      hasAllRights: [Function (anonymous)],   
      hasSomeRights: [Function (anonymous)]   
    },
    tenants: [
      {
        PartitionKey: 'acctenantusdev',       
        RowKey: '',
        Timestamp: 2022-05-09T18:45:17.338Z,  
        displayName: 'Aderant US Dev Environment',
        azureLocation: 'eastus2',
        deploymentStatus: 'Development',      
        apiSecret: '5640e342b30042268eba508b6ec90d7d',
        dbConnectionString: 'Server=tcp:acctenantusdev.database.windows.net,1433;Initial Catalog=acctenantusdev;Persist Security Info=False;User ID=sqladmin;Password=Cd644094d4384cd3aa1cdd6e60273dda;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;',
        storageConnectionString: 'DefaultEndpointsProtocol=https;AccountName=acctenantusdev;AccountKey=qEejVudWfyr/E6AMVku19Aidw7n+s2HdwyCXlNtkwu8n+d3Gm/Gv5pgCHV5cUVQ9+gzSEHtOMmLulXyGx/SL2g==;EndpointSuffix=core.windows.net',
        settings: '{}',
        tenantId: 'acctenantusdev'
      },
      {
        PartitionKey: 'bb',
        RowKey: '',
        Timestamp: 2022-05-09T18:18:43.740Z,  
        displayName: 'Bill Blast Dev',        
        azureLocation: 'eastus2',
        deploymentStatus: 'Development',      
        apiSecret: 'ad73d630-83aa-4f72-9819-c2254dd318eef446a3d2-34bc-4449-b10c-2a4ce0cdfd16',
        dbConnectionString: 'Data source=accbbusdev.database.windows.net;Initial Catalog=accbbusdev;User ID=adminbb;Password=477cSC7f43ubWiXxnGLDdIyOmjwHc6WR;',
        storageConnectionString: 'DefaultEndpointsProtocol=https;AccountName=accbbusdev;AccountKey=jvZ0WJFmCQoETwPUTlOj2dwgqaBQ2tBcmjYYmoy78kIQGV9W9TqlkyDJIQEFdh76E3V8j56S2fftGQiqBCgX1g==;',
        settings: '{}',
        tenantId: 'bb'
      },
      {
        PartitionKey: 'cwk',
        RowKey: '',
        Timestamp: 2022-05-11T20:48:11.994Z,  
        displayName: 'cwk',
        azureLocation: '',
        deploymentStatus: 'Implementation',   
        apiSecret: '08c8aa7a-8d2f-43cb-a7ff-f057e046a5ceb2f5a2d2-2411-4333-b2b0-37bbe11ea344',
        dbConnectionString: 'Data source=acccwkusdev.database.windows.net;Initial Catalog=acccwkusdev;User ID=admincwk;Password=TZFzivoe6Qrm7TwBgorbou31ZvJJyD8a;',
        storageConnectionString: 'DefaultEndpointsProtocol=https;AccountName=acccwkusdev;AccountKey=OHtZb+EHsUuUBuLP7jBU6J/Re4ztkQpxh5LXD/ZvVm2kh1TG0kTTEMfWootWMZe7mow/rVe+0B2VWSRAboX5IA==;',
        settings: '{}',
        tenantId: 'cwk'
      },
      {
        PartitionKey: 'cwk2',
        RowKey: '',
        Timestamp: 2022-05-13T18:26:08.033Z,  
        displayName: 'cwk2',
        azureLocation: '',
        deploymentStatus: 'Implementation',   
        apiSecret: 'f569a3fa-0cfc-41c2-8212-3b6fc69096f1c4665a70-36dd-4920-b9b2-361ad46a4a14',
        dbConnectionString: 'Data source=acccwk2usdev.database.windows.net;Initial Catalog=acccwk2usdev;User ID=admincwk2;Password=IGtvVCgr2Xb5mthPqs2RJtbj02bXlRzQ;',
        storageConnectionString: 'DefaultEndpointsProtocol=https;AccountName=acccwk2usdev;AccountKey=hH4+DoFrpf5Lk5BY+K/BhPNbFoHsmJLXR9kZ3PUzxIG440c3JF/+BWZ4XcOYJJL950bwS2kXNZkLLPwHW+fXEA==;',
        settings: '{}',
        tenantId: 'cwk2'
      },
      {
        PartitionKey: 'expert',
        RowKey: '',
        Timestamp: 2022-05-09T17:57:16.373Z,  
        displayName: 'Expert Development',    
        azureLocation: 'eastus2',
        deploymentStatus: 'Development',      
        apiSecret: 'a815f0c1-cd99-466e-96e8-94c57983c365699f2d9a-c4b5-48f4-9064-343f1b1df41f',
        dbConnectionString: 'Data source=accexpertusdev.database.windows.net;Initial Catalog=accexpertusdev;User ID=adminexpert;Password=VtzOE7e62HdcsgovOSIGI6uaBtYcL5DH;',      
        storageConnectionString: 'DefaultEndpointsProtocol=https;AccountName=accexpertusdev;AccountKey=CIwMYCru5Jax8S/W8ZPEqBMMZg8D3dtI14FinvxBu4iIVTlNENaho8DN4zPAYNw9qC2eGsdJicYRfgg6ujtVyw==;',
        settings: '{}',
        tenantId: 'expert'
      },
      {
        PartitionKey: 'lib',
        RowKey: '',
        Timestamp: 2022-05-24T15:55:28.188Z,  
        displayName: 'Aderant Rules Library', 
        azureLocation: 'eastus2',
        deploymentStatus: 'Production',       
        apiSecret: '400df5eb-20f1-43d8-83b2-dd6d06b274d7cf93c22a-5bc9-4f55-9a85-989dad40c4b3',
        dbConnectionString: 'Data source=acclibusdev.database.windows.net;Initial Catalog=acclibusdev;User ID=adminlib;Password=HRBRG655YWEaGuWUSb8fQRJXgbY4tXxE;',
        storageConnectionString: 'DefaultEndpointsProtocol=https;AccountName=acclibusdev;AccountKey=w+bsMOt6qv5gLJci2+hQyI4znwKlNuki9C/k67ILmKkjPwewx19WvHIGZ6UebVZ/gimlSp8YQuw1jP38jEQB+w==;',
        settings: '{}',
        tenantId: 'lib'
      },
      {
        PartitionKey: 'ocg',
        RowKey: '',
        Timestamp: 2022-05-09T18:19:02.266Z,  
        displayName: 'OCG Dev',
        azureLocation: 'eastus2',
        deploymentStatus: 'Development',      
        apiSecret: 'ff0a7c04-e13f-4c10-8578-227a7a82d5187159565f-cbf3-47b9-86eb-e9bdf7bd4940',
        dbConnectionString: 'Data source=accocgusdev.database.windows.net;Initial Catalog=accocgusdev;User ID=adminocg;Password=C8XqaTbs3Lzg8R6gH1IFjAAWBr79gxB3;',
        storageConnectionString: 'DefaultEndpointsProtocol=https;AccountName=accocgusdev;AccountKey=+45zutTXKPYrFaeJbNqLdNkk/0rVD4Db5Z1AOOaar4zrP17u3s6rRMZbixs4nxyIFpnnHQQONNp3YExEC3gIQw==;',
        settings: '{}',
        tenantId: 'ocg'
      },
      {
        PartitionKey: 'perfdev',
        RowKey: '',
        Timestamp: 2022-05-09T19:49:14.061Z,  
        displayName: 'Performance',
        azureLocation: 'eastus2',
        deploymentStatus: 'Development',      
        apiSecret: '55596d2a-f430-4c9c-a484-addf6e285575434c541e-6529-40fd-8709-b01e4902f5b8',
        dbConnectionString: 'Data source=accperfdevusdev.database.windows.net;Initial Catalog=accperfdevusdev;User ID=adminperfdev;Password=kRx59UiDkKVE04CiujQywVmX0dL4t66y;',   
        storageConnectionString: 'DefaultEndpointsProtocol=https;AccountName=accperfdevusdev;AccountKey=xENKqJLaZbqr7fiYPkp89s357GxbN3NJGvxkuRWZNXXQ/yCNsBdVbltqQ5CiH/0W/H3HCCWtuX6wDqO0RBxsQA==;',
        settings: '{}',
        tenantId: 'perfdev'
      },
      {
        PartitionKey: 'sr',
        RowKey: '',
        Timestamp: 2022-06-29T14:54:25.414Z,  
        displayName: "Shelby's Dev Tenancy",  
        azureLocation: 'eastus2',
        deploymentStatus: 'Development',      
        apiSecret: 'f432bde6-402e-41de-a4cb-67b722ed16ba92b68684-077e-49d0-8e57-e359c6e6018a',
        dbConnectionString: 'Data source=accsrusdev.database.windows.net;Initial Catalog=accsrusdev;User ID=adminsr;Password=Ot5oYcVgxB7H4SxLFWKE26eJ5kvzfU4U;',
        storageConnectionString: 'DefaultEndpointsProtocol=https;AccountName=accsrusdev;AccountKey=Plumb2Rm3XSJ3aF7sSc8Mm2XiPkZe0ILMIdSAPYhkfqpvGms7SYb/5hLICuewvfWVvjtDkZcWP7MojXpS8TZuA==;',
        settings: '{}',
        tenantId: 'sr'
      }
    ],
    layout: 'layouts/tenant',
    tenantId: 'sr',
    tenantData: {
      PartitionKey: 'sr',
      RowKey: '',
      Timestamp: 2022-06-29T14:54:25.414Z,    
      displayName: "Shelby's Dev Tenancy",    
      azureLocation: 'eastus2',
      deploymentStatus: 'Development',        
      apiSecret: 'f432bde6-402e-41de-a4cb-67b722ed16ba92b68684-077e-49d0-8e57-e359c6e6018a',
      dbConnectionString: 'Data source=accsrusdev.database.windows.net;Initial Catalog=accsrusdev;User ID=adminsr;Password=Ot5oYcVgxB7H4SxLFWKE26eJ5kvzfU4U;',
      storageConnectionString: 'DefaultEndpointsProtocol=https;AccountName=accsrusdev;AccountKey=Plumb2Rm3XSJ3aF7sSc8Mm2XiPkZe0ILMIdSAPYhkfqpvGms7SYb/5hLICuewvfWVvjtDkZcWP7MojXpS8TZuA==;',
      settings: '{}',
      tenantId: 'sr'
    },
    contentFor: [Function: contentFor],       
    _locals: [Object: null prototype] {       
      messages: {},
      selectLists: {
        deploymentStatusList: [Array],        
        azureLocations: [Array],
        securityRoles: [Array]
      },
      security: {
        user: [User],
        userAccessRights: [Map],
        ACCESS_RIGHT_CODES: [Object],
        hasRight: [Function: bound has],      
        hasAllRights: [Function (anonymous)], 
        hasSomeRights: [Function (anonymous)] 
      },
      tenants: [
        [Object], [Object],
        [Object], [Object],
        [Object], [Object],
        [Object], [Object],
        [Object]
      ],
      layout: 'layouts/tenant',
      tenantId: 'sr',
      tenantData: {
        PartitionKey: 'sr',
        RowKey: '',
        Timestamp: 2022-06-29T14:54:25.414Z,  
        displayName: "Shelby's Dev Tenancy",  
        azureLocation: 'eastus2',
        deploymentStatus: 'Development',      
        apiSecret: 'f432bde6-402e-41de-a4cb-67b722ed16ba92b68684-077e-49d0-8e57-e359c6e6018a',
        dbConnectionString: 'Data source=accsrusdev.database.windows.net;Initial Catalog=accsrusdev;User ID=adminsr;Password=Ot5oYcVgxB7H4SxLFWKE26eJ5kvzfU4U;',
        storageConnectionString: 'DefaultEndpointsProtocol=https;AccountName=accsrusdev;AccountKey=Plumb2Rm3XSJ3aF7sSc8Mm2XiPkZe0ILMIdSAPYhkfqpvGms7SYb/5hLICuewvfWVvjtDkZcWP7MojXpS8TZuA==;',
        settings: '{}',
        tenantId: 'sr'
      }
    },
    cache: false
  }