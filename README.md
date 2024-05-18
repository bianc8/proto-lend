# Protolend

Protolend is a decentralized lending protocol that allows users to borrow and lend assets on top of *Protokit* framework.

**Features**
Here are the main features of the Protolend protocol:
- **Lending**: Users can deposit MINA to borrow against it.
- **Borrow**: Users can borrow USDC using their collateral up until a max of 80% of lent amount.
- **Repay**: Users can repay their borrowed amount and unlock their collateral.
- **Withdraw**: Users can withdraw their collateral after repaying their borrowed amount.

## Implementation details

*Protolend* implements the Lending runtime module (you can find it [here](https://github.com/bianc8/proto-lend/blob/main/packages/chain/src/lending.ts)).

## Testing

We have written tests for the Lending runtime module. You can find them [here](https://github.com/bianc8/proto-lend/blob/main/packages/chain/test/lending.test.ts).

## Screenshot

![screen lend](https://github.com/bianc8/proto-lend/blob/main/apps/web/public/screen-lend.png?raw=true)
![screen borrow](https://github.com/bianc8/proto-lend/blob/main/apps/web/public/screen-borrow.png?raw=true)


## Quick start

The monorepo contains 1 package and 1 app:

- `packages/chain` contains everything related to your app-chain
- `apps/web` contains a demo UI that connects to your locally hosted app-chain sequencer

**Prerequisites:**

- Node.js v18
- pnpm
- nvm

> If you're on windows, please use Docker until we find a more suitable solution to running the `@proto-kit/cli`. 
> Run the following command and then proceed to "Running the sequencer & UI":
>
> `docker run -it --rm -p 3000:3000 -p 8080:8080 -v %cd%:/starter-kit -w /starter-kit gplane/pnpm:node18 bash`


### Setup

```zsh
git clone https://github.com/proto-kit/starter-kit my-chain
cd my-chain

# ensures you have the right node.js version
nvm use
pnpm install
```

### Running the sequencer & UI

```zsh
# starts both UI and sequencer locally
pnpm dev

# starts UI only
pnpm dev -- --filter web
# starts sequencer only
pnpm dev -- --filter chain
```

### Running tests
```zsh
# run and watch tests for the `chain` package
pnpm run test --filter=chain -- --watchAll
```

Navigate to `localhost:3000` to see the example UI, or to `localhost:8080/graphql` to see the GQL interface of the locally running sequencer.
