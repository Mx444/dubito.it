import { ReviewModel } from "../models/reviewModel";
import { TokenController } from "./tokenController";
import { AdController } from "./adController";
import { ServiceContainer } from "../services/servicesContainer";

export class ReviewController {
  private _reviews: Array<ReviewModel> = [];
  private _tokenIstance: TokenController;
  private _adIstance: AdController;

  constructor() {
    this._reviews = [];
    this._tokenIstance = ServiceContainer.getTokenController();
    this._adIstance = ServiceContainer.getAdController();
  }

  public addReview(token: number, adRefereceKey: number, title: string, description: string, rating: any): number {
    const userReference = this._tokenIstance.findReferenceByToken(token);
    const adReference = this._adIstance.findAdByKey(adRefereceKey);

    const isUserOwner: boolean = userReference!.userPrimaryKey === adReference!.userReferenceKey;
    if (isUserOwner === false) {
      throw new Error("Invalid user");
    }

    const createReview = new ReviewModel(
      userReference!.userPrimaryKey,
      adReference!.primaryKey,
      title,
      description,
      rating,
    );
    this._reviews = [...this._reviews, createReview];
    return createReview.primaryKey;
  }

  public editReview(token: number, reviewPrimaryKey: number, type: string, newValue: any) {
    const userReference = this._tokenIstance.findReferenceByToken(token);
    const reviewReference = this.getReferenceByReview(reviewPrimaryKey);

    const isUserOwner: boolean = userReference!.userPrimaryKey === reviewReference!.userReferenceKey;
    if (isUserOwner === false) {
      throw new Error("Invalid User");
    }

    this._reviews = this._reviews.map((review) => {
      if (review.primaryKey === reviewReference!.primaryKey) {
        switch (type) {
          case "title":
            review.title = newValue;
            break;
          case "description":
            review.description = newValue;
            break;
          case "rating":
            review.rating = newValue;
            break;
          default:
            console.log("Invalid edit type");
            return review;
        }
      }
      return review;
    });
  }

  public removeReview(token: number, primaryKeyReview: number): void {
    const userReference = this._tokenIstance.findReferenceByToken(token);
    const reviewReference = this.getReferenceByReview(primaryKeyReview);

    const isUserOwner: boolean = userReference!.userPrimaryKey === reviewReference!.userReferenceKey;
    if (isUserOwner === false) {
      throw new Error("Invalid User");
    }

    this._reviews = this._reviews.filter((review) => review.primaryKey !== reviewReference!.primaryKey);
  }

  public getReferenceByReview(reviewPrimaryKey: number): ReviewModel | undefined {
    const review = this._reviews.find((review) => review.primaryKey === reviewPrimaryKey);
    if (!review) {
      throw new Error("Key not found!");
    }
    return review;
  }

  get review(): ReadonlyArray<ReviewModel> {
    return [...this._reviews];
  }
}
