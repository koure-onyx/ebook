import { success } from '../utils/apiResponse.js';
import * as vaultService from '../services/vault.service.js';

export async function getVault(req, res, next) {
  try {
    const items = await vaultService.getUserVaultItems(req.user._id);
    // Transform items to match frontend expected format
    const transformedItems = items.map(item => ({
      _id: item._id,
      topicTitle: item.topic_id?.title || 'Untitled',
      itemType: item.type,
      content: item.flashcard || item.note || item.highlight || item.video,
      createdAt: item.createdAt,
      topicId: item.topic_id?._id,
    }));
    res.json(success({
      user_id: req.user._id,
      items_count: transformedItems.length,
      items: transformedItems,
    }));
  } catch (err) {
    next(err);
  }
}

export async function addToVault(req, res, next) {
  try {
    const { topicId } = req.params;
    const vault = await vaultService.addToVault(req.user._id, topicId);
    res.json(success(vault, 'Topic added to vault'));
  } catch (err) {
    next(err);
  }
}

export async function removeFromVault(req, res, next) {
  try {
    const { topicId } = req.params;
    const vault = await vaultService.removeFromVault(req.user._id, topicId);
    res.json(success(vault, 'Topic removed from vault'));
  } catch (err) {
    next(err);
  }
}

export async function checkVaultStatus(req, res, next) {
  try {
    const { topicId } = req.params;
    const isInVault = await vaultService.isInVault(req.user._id, topicId);
    res.json(success({ isInVault }));
  } catch (err) {
    next(err);
  }
}

export async function getVaultStats(req, res, next) {
  try {
    const stats = await vaultService.getVaultStats(req.user._id);
    res.json(success(stats));
  } catch (err) {
    next(err);
  }
}
