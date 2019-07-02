```mermaid
graph BT
  subgraph js-uprctl
  subgraph services
  UprtclService-->UserService
  UprtclMultiplatform-->UprtclService
  UprtclService-->Entity
  MergeStrategy-->UprtclService
  MergeStrategy-->DataService
  end
  end
  subgraph Web-Component
  subgraph redux
  drafts-->DraftService
  documents-->DataService
  user-->UserService
  multiplatform-->UprtclMultiplatform
  uprtcl-->user
  multiplatform-->uprtcl
  editor-->uprtcl
  editor-->drafts
  editor-->documents
  end
  subgraph UI
  co-editor-->editor
  co-editor-->drafts
  end
  end
```

### Responsabilities of each module:
- User: deal with the user information and expose it to the UI

- Uprtcl: deal with basic context, perspectives and commit objects
- Multiplatform: add multiplatform features to Uprtcl

- Draft: update drafts for a given element id
- Data: get and create TextNode data

- Editor: aggregate uprtcl, draft and data funcionality and expose it to the frontend
