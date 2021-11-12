pragma solidity >=0.4.21 <0.6.0;
pragma experimental ABIEncoderV2;

// TODO define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>
import "./ERC721Mintable.sol";
import "./verifier.sol";

// TODO define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
contract SolnSquareVerifier is ERC721Mintable, Verifier {
    // TODO define a solutions struct that can hold an index & an address
    struct Solution {
        address to;
        uint256 tokenId;
        Proof proof;
        bool exists;
        bool minted;
    }

    uint256 private solutionCount;
    // TODO define an array of the above struct
    mapping(uint256 => Solution) private solutions;
    // TODO define a mapping to store unique solutions submitted
    mapping(bytes32 => uint256) private key2token;

    // TODO Create an event to emit when a solution is added
    event SolutionAdded(bytes32 generatedId, uint256 tokenId, address owner);

    // TODO Create a function to add the solutions to the array and emit the event
    function addSolution(
        address to,
        uint256 tokenId,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory input
    ) public {
        Proof memory proof = Proof(
            Pairing.G1Point(a[0], a[1]),
            Pairing.G2Point(b[0], b[1]),
            Pairing.G1Point(c[0], c[1])
        );

        bytes32 keyId = keccak256(
            abi.encodePacked(a[0], a[1], b[0], b[1], c[0], c[1], input)
        );
        uint256 mappedTokenId = key2token[keyId];
        require(solutions[mappedTokenId].exists == false, "Solution exists");
        bool validProof = verifyTx(proof, input);
        require(validProof == true, "Proof is not valid");

        key2token[keyId] = tokenId;
        solutions[tokenId] = Solution(to, tokenId, proof, true, false);

        emit SolutionAdded(keyId, tokenId, to);
    }

    // TODO Create a function to mint new NFT only after the solution has been verified
    //  - make sure the solution is unique (has not been used before)
    //  - make sure you handle metadata as well as tokenSuplly
    function mint(address to, uint256 tokenId) public returns (bool) {
        require(solutions[tokenId].exists == true, "No Solution provided");
        require(solutions[tokenId].minted == false, "token has been minted");
        require(solutions[tokenId].to == to, "invalid Address provided");

        solutions[tokenId].minted = true;
        return super.mint(to, tokenId);
    }
}
